using Application.Activities;
using Application.Core;
using Application.Tickets;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;
using System.Security.Claims;

namespace API.Controllers
{
    public class ActivitiesController : BaseApiController
    {
        private readonly IConfiguration _configuration;

        public ActivitiesController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<IActionResult> GetActivities([FromQuery] ActivityParams param, string searchTerm)
        {
            Result<PagedList<ActivityDto>> result;

            if (!string.IsNullOrEmpty(searchTerm))
            {
                // If searchTerm is provided, filter activities by title
                result = await Mediator.Send(new List.Query { Params = param, SearchTerm = searchTerm });
            }
            else
            {
                // Otherwise, return all activities
                result = await Mediator.Send(new List.Query { Params = param });
            }

            return HandlePagedResult<ActivityDto>(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetActivity(Guid id)
        {
            return HandleResult(await Mediator.Send(new Details.Query { Id = id }));
        }

        [HttpPost("{id}/tickets")] // Endpoint for purchasing tickets
        public async Task<IActionResult> PurchaseTickets(Guid id, PurchaseTicket.Command command)
        {
            // Get the ID of the current user
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Pass the user ID to the command
            command.UserId = userId;

            // Set the activity ID
            command.ActivityId = id;

            return HandleResult(await Mediator.Send(command));
        }


        [HttpGet("{activityId}/has-purchased")]
        [Authorize]
        public async Task<IActionResult> CheckIfUserHasPurchased(Guid activityId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var query = new CheckIfUserHasPurchasedTicket.Query
            {
                ActivityId = activityId,
                UserId = userId
            };

            var hasPurchased = await Mediator.Send(query);

            return Ok(hasPurchased);
        }

        [HttpPost]
        public async Task<IActionResult> CreateActivity(Activity activity)
        {
            return HandleResult(await Mediator.Send(new Create.Command { Activity = activity }));
        }

        [Authorize(Policy = "IsActivityHost")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Edit(Guid id, Activity activity)
        {
            activity.Id = id;
            return HandleResult(await Mediator.Send(new Edit.Command { Activity = activity }));
        }

        [HttpDelete("delete/{id}")] // Example of a different route
        public async Task<IActionResult> DeleteWithoutAuth(Guid id)
        {
            return HandleResult(await Mediator.Send(new Delete.Command { Id = id }));
        }


        [Authorize(Policy = "IsActivityHost")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            return HandleResult(await Mediator.Send(new Delete.Command { Id = id }));
        }

        [HttpPost("{id}/attend")]
        public async Task<IActionResult> Attend(Guid id)
        {
            return HandleResult(await Mediator.Send(new UpdateAttendance.Command { Id = id }));
        }

        [HttpPost("{id}/rate")] // New endpoint for rating an activity
        public async Task<IActionResult> RateActivity(Guid id, Rate.Command command)
        {
            // Get the ID of the current user
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Pass the user ID to the command
            command.UserId = userId;

            // Set the activity ID
            command.ActivityId = id;

            return HandleResult(await Mediator.Send(command));
        }


        private const string StripeSecretKey = "sk_test_51PLpOJEWVw1xAHG0XXpo4Mu4BEiTsAJBSFONNnQEHOvU67kpg0ffAzdR4HiNoNFGGYEQl6pQyXBKBKlUunwz7EcL00VXy4cvNm";

        [HttpPost("payments/create-checkout-session")]
        [AllowAnonymous]
        public IActionResult CreateCheckoutSession(Activity activity)
        {
            StripeConfiguration.ApiKey = StripeSecretKey;

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string>
                {
                    "card",
                },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            UnitAmount = activity.TicketQuantityAvailable*100,
                            Currency = "usd",
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = activity.Title,
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",


                // this 2 pages will be implmented in front side (React)
                SuccessUrl = "http://localhost:3000/success",
                CancelUrl = "http://localhost:3000/cancel",
            };

            var service = new SessionService();
            Session session = service.Create(options);

            return Ok(new { sessionId = session.Id });
        }


    }




}