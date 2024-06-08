using Application.Core;
using MediatR;

using Persistence;
using Stripe;

namespace Application.Activities
{
    
    public class PurchaseTicket
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid ActivityId { get; set; }
            public string TicketType { get; set; }
            public string UserId { get; set; } // Added UserId property
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly StripeClient _stripeClient; // Stripe client

            public Handler(DataContext context, StripeClient stripeClient)
            {
                _context = context;
                _stripeClient = stripeClient;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await _context.Activities.FindAsync(request.ActivityId);

                if (activity == null)
                {
                    return Result<Unit>.Failure("Activity not found");
                }

                if (!activity.RequiresPayment)
                {
                    return Result<Unit>.Failure("This activity does not require payment for tickets");
                }

                // Increment QuantitySold
                activity.TicketQuantitySold++;

                // Create a new ticket
                var ticket = new Ticket
                {
                    ActivityId = activity.Id,
                    PurchaserId = new Guid(request.UserId), // Set the PurchaserId to the user's ID
                    Type = request.TicketType,
                    Price = activity.TicketPrice,
                    Currency = "USD",
                    
                    // You can add more properties as needed
                };

                // Add the ticket to the context
                _context.Tickets.Add(ticket);

                // Save changes to the database
                var result = await _context.SaveChangesAsync(cancellationToken) > 0;

                if (!result)
                {
                    return Result<Unit>.Failure("Failed to purchase ticket");
                }

                return Result<Unit>.Success(Unit.Value);
            }

            private async Task<Result<Unit>> ProcessPaymentAsync(decimal amount, string currency)
            {
                try
                {
                    var options = new PaymentIntentCreateOptions
                    {
                        Amount = (long)(amount * 100), // Convert to cents
                        Currency = currency,
                        PaymentMethodTypes = new List<string> { "card" }, // Accept card payments
                    };

                    var service = new PaymentIntentService(_stripeClient);
                    var paymentIntent = await service.CreateAsync(options);

                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception)
                {
                    // Log the exception or handle it accordingly
                    return Result<Unit>.Failure("Payment processing with Stripe failed");
                }
            }
        }
    }
}