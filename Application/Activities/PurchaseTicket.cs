using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Tickets
{
    public class PurchaseTicket
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid ActivityId { get; set; }
            public string TicketType { get; set; }
            public string UserId { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
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

                activity.TicketQuantitySold++;

                var ticket = new Ticket
                {
                    ActivityId = activity.Id,
                    UserId = request.UserId,
                    Type = request.TicketType,
                    Price = activity.TicketPrice,
                    Currency = "USD",
                    HasPurchased = true  // Set HasPurchased to true when creating a ticket
                };

                _context.Tickets.Add(ticket);

                var result = await _context.SaveChangesAsync(cancellationToken) > 0;
                if (result)
                {
                    return Result<Unit>.Success(Unit.Value);
                }
                else
                {
                    return Result<Unit>.Failure("Failed to save changes to the database");
                }
            }
        }
    }
}
