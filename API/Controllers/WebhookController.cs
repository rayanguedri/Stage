using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Stripe;
using Stripe.Checkout;
using System;
using System.IO;
using System.Threading.Tasks;
using Domain; // Add this line
using Persistence; // Add this line
using Microsoft.AspNetCore.Identity; // Add this line

namespace API.Controllers
{
    [AllowAnonymous]
    [Route("webhook")]
    [ApiController]
    public class WebhookController : ControllerBase
    {
        private const string StripeWebhookSecret = "whsec_147d74a738bdeaec86c400d92f8b2d19ec409c4ef3bbb9a8aa193183b224e78d";
        private readonly ILogger<WebhookController> _logger;
        private readonly DataContext _context; // Modify this line
        private readonly UserManager<AppUser> _userManager; // Add this line

        public WebhookController(ILogger<WebhookController> logger, DataContext context, UserManager<AppUser> userManager) // Modify constructor
        {
            _logger = logger;
            _context = context; // Assign the context
            _userManager = userManager; // Assign the user manager
        }

        [HttpPost]
        public async Task<IActionResult> HandleWebhook()
        {
            try
            {
                _logger.LogInformation("Handling webhook request...");

                using var reader = new StreamReader(HttpContext.Request.Body);
                var json = await reader.ReadToEndAsync();

                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    StripeWebhookSecret
                );

                var eventType = stripeEvent.Type;
                _logger.LogInformation($"Stripe Event Type: {eventType}");

                if (eventType == Events.CheckoutSessionCompleted)
                {
                    var session = stripeEvent.Data.Object as Session;
                    await HandleCheckoutSessionCompleted(session); // Modify to await the async method
                }

                return Ok();
            }
            catch (StripeException e)
            {
                _logger.LogError($"Stripe exception: {e.Message}");
                return BadRequest();
            }
            catch (Exception ex)
            {
                _logger.LogError($"An error occurred: {ex.Message}");
                return StatusCode(500);
            }
        }

        private async Task HandleCheckoutSessionCompleted(Session session) // Modify to async Task
        {
            var customerEmail = session.CustomerDetails.Email;
            var paymentIntentId = session.PaymentIntentId;

            _logger.LogInformation($"aLL SESSION DATA : {session}");
            _logger.LogInformation($"Checkout Session completed: {session.Id}");
            _logger.LogInformation($"Customer Email: {customerEmail}");
            _logger.LogInformation($"Payment Intent ID: {paymentIntentId}");

            // Find user by email
            var user = await _userManager.FindByEmailAsync(customerEmail);

            // Create and save the StripeSession entity
            var stripeSession = new StripeSession
            {
                SessionId = session.Id,
                CustomerEmail = customerEmail,
                PaymentIntentId = paymentIntentId,
                CreatedAt = DateTime.UtcNow,
                UserId = user?.Id // Associate user if found
            };

            _context.StripeSessions.Add(stripeSession); // Add session to context
            await _context.SaveChangesAsync(); // Save changes to database
        }
    }
}
