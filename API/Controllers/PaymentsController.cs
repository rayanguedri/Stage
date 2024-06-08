using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Stripe;
using Stripe.Checkout;

namespace API.Controllers
{
    
    public class PaymentsController : BaseApiController
    {
        private readonly PaymentService _paymentService;
        private readonly DataContext _context;
        private readonly IConfiguration _config;

        public PaymentsController(PaymentService paymentService, DataContext context, IConfiguration config)
        {
            _config = config;
            _context = context;
            _paymentService = paymentService;
        }

        [Authorize]
        [HttpPost("{activityId}")]
        public async Task<ActionResult> PurchaseTicket(Guid activityId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == User.Identity.Name);
            

            if (user == null)
                return Unauthorized();

            var activity = await _context.Activities.FirstOrDefaultAsync(a => a.Id == activityId);

            if (activity == null)
                return NotFound();

            var paymentIntent = await _paymentService.CreateOrUpdatePaymentIntent(activity, user.Id);

            if (paymentIntent == null)
                return BadRequest(new { error = "Problem creating payment intent" });

            var ticket = new Ticket
            {
                ActivityId = activity.Id,
                Type = "General Admission", // Set ticket type accordingly
                Price = activity.TicketPrice,
                Currency = "USD", // Adjust as needed
                PurchaserId = Guid.Parse(user.Id)// Set purchaser ID
            };

            _context.Tickets.Add(ticket);
            var result = await _context.SaveChangesAsync() > 0;

            if (!result)
                return BadRequest(new { error = "Problem purchasing ticket" });

            return Ok(new { success = "Ticket purchased successfully" });
        }

        [AllowAnonymous]
        [HttpPost("webhook")]
        public async Task<ActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _config["StripeSettings:WhSecret"]);

            if (stripeEvent.Type == Events.PaymentIntentSucceeded)
            {
                var paymentIntent = (PaymentIntent)stripeEvent.Data.Object;
                var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.PaymentIntentId == paymentIntent.Id);

                if (ticket != null)
                {
                    ticket.PaymentIntentId = null; // Clear payment intent ID
                    await _context.SaveChangesAsync();
                }
            }

            return new EmptyResult();
        }


        
    }
}
