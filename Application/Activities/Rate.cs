using Application.Core;
using MediatR;
using Persistence;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities
{
    public class Rate
    {
        public class Command : IRequest<Result<Unit>>
        {
            public string UserId { get; set; } // ID of the user who is rating the activity
            public Guid ActivityId { get; set; } // ID of the activity being rated
            public int Value { get; set; } // Rating value given by the user (e.g., 1 to 5 stars)
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
                // Retrieve the activity from the database
                var activity = await _context.Activities
                    .Include(a => a.Ratings) // Include ratings related to the activity
                    .FirstOrDefaultAsync(a => a.Id == request.ActivityId);

                if (activity == null)
                {
                    return Result<Unit>.Failure("Activity not found");
                }

                // Convert the UserId from string to Guid
                var userId = new Guid(request.UserId);

                // Check if the user has already rated this activity
                var existingRating = activity.Ratings.FirstOrDefault(r => r.UserId == userId);

                if (existingRating != null)
                {
                    // Update existing rating
                    existingRating.Value = request.Value;
                }
                else
                {
                    // Create a new rating
                    var newRating = new Rating
                    {
                        UserId = userId,
                        ActivityId = request.ActivityId,
                        Value = request.Value
                    };

                    // Add the new rating to the activity
                    activity.Ratings.Add(newRating);
                }

                // Recalculate the average rating for the activity
                activity.AverageRating = CalculateAverageRating(activity);

                // Save changes to the database
                var result = await _context.SaveChangesAsync(cancellationToken) > 0;

                if (!result)
                {
                    return Result<Unit>.Failure("Failed to rate activity");
                }

                return Result<Unit>.Success(Unit.Value);
            }

            private double CalculateAverageRating(Activity activity)
            {
                if (activity.Ratings.Count == 0)
                {
                    return 0; // Return 0 if there are no ratings yet
                }

                // Calculate the average rating
                double totalRating = activity.Ratings.Sum(r => r.Value);
                double averageRating = totalRating / activity.Ratings.Count;

                return averageRating;
            }
        }
    }
}
