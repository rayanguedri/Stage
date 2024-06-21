using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Stripe;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Activities
{
    public class PurchaseTicket
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid ActivityId { get; set; }
            public string TicketType { get; set; }
            public string UserId { get; set; } // Add UserId property
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly StripeClient _stripeClient;

            public Handler(DataContext context, StripeClient stripeClient)
            {
                _context = context;
                _stripeClient = stripeClient;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                try
                {
                    // Check if the user exists in the system (optional, for validation purposes)
                    var user = await _context.Users.FindAsync(request.UserId);
                    if (user == null)
                    {
                        return Result<Unit>.Failure($"User with ID {request.UserId} not found");
                    }

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
                        UserId = request.UserId, // Set the UserId to the user's ID
                        Type = request.TicketType,
                        Price = activity.TicketPrice,
                        Currency = "USD",
                        // You can add more properties as needed
                    };

                    // Add the ticket to the context
                    _context.Tickets.Add(ticket);

                    // Save changes to the database
                    var result = await _context.SaveChangesAsync(cancellationToken);

                    if (result > 0)
                    {
                        return Result<Unit>.Success(Unit.Value);
                    }
                    else
                    {
                        return Result<Unit>.Failure("Failed to save changes to the database");
                    }
                }
                catch (DbUpdateException ex)
                {
                    // Log the specific exception message for debugging
                    // You can also include ex.InnerException.Message for more detailed error
                    return Result<Unit>.Failure($"Database update error: {ex.Message}");
                }
                catch (Exception ex)
                {
                    // Handle other exceptions
                    return Result<Unit>.Failure($"An error occurred: {ex.Message}");
                }
            }
        }
    }
}
