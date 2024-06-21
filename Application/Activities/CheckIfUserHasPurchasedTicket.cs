using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Tickets
{
    public class CheckIfUserHasPurchasedTicket
    {
        public class Query : IRequest<bool>
        {
            public Guid ActivityId { get; set; }
            public string UserId { get; set; }
        }

        public class Handler : IRequestHandler<Query, bool>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<bool> Handle(Query request, CancellationToken cancellationToken)
            {
                // Check if any ticket for the activity with HasPurchased = true exists for the user
                return await _context.Tickets
                    .Where(t => t.ActivityId == request.ActivityId && t.UserId == request.UserId && t.HasPurchased)
                    .AnyAsync(cancellationToken);
            }
        }
    }
}
