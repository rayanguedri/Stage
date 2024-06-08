using Domain;
using Stripe;

namespace API.Services
{
    public class PaymentService
    {
        private readonly IConfiguration _config;
        public PaymentService(IConfiguration config)
        {
            _config = config;
        }

        public async Task<PaymentIntent> CreateOrUpdatePaymentIntent(Activity activity, string userId)
        {
            StripeConfiguration.ApiKey = _config["StripeSettings:SecretKey"];

            var service = new PaymentIntentService();

            // Assuming the ticket price is stored in the activity model
            var amount = (long)(activity.TicketPrice * 100); // Convert to cents

            var options = new PaymentIntentCreateOptions
            {
                Amount = amount,
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" },
                Metadata = new Dictionary<string, string>
                {
                    { "activityId", activity.Id.ToString() },
                    { "userId", userId }
                }
            };

            var intent = await service.CreateAsync(options);

            return intent;
        }
    }
}
