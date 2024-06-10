using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Stripe;
using Stripe.Checkout;
using System;
using System.IO;
using System.Threading.Tasks;

namespace API.Controllers
{
    [AllowAnonymous]
    [Route("webhook")]
    [ApiController]
    public class WebhookController : ControllerBase
    {
        private const string StripeWebhookSecret = "whsec_147d74a738bdeaec86c400d92f8b2d19ec409c4ef3bbb9a8aa193183b224e78d";
        private readonly ILogger<WebhookController> _logger;

        public WebhookController(ILogger<WebhookController> logger)
        {
            _logger = logger;
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
                    HandleCheckoutSessionCompleted(session);
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

        private void HandleCheckoutSessionCompleted(Session session)
        {
            var customerEmail = session.CustomerDetails.Email;
            var paymentIntentId = session.PaymentIntentId;
            _logger.LogInformation($"aLL SESSION DATA : {session}");

            _logger.LogInformation($"Checkout Session completed: {session.Id}");
            _logger.LogInformation($"Customer Email: {customerEmail}");
            _logger.LogInformation($"Payment Intent ID: {paymentIntentId}");
        }
    }
}
