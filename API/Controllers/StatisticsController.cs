using Application.Activities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    // [Route("api/statistics")]
    public class StatisticsController : ControllerBase
    {
        private readonly DataContext _context;

        public StatisticsController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("api/statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var statistics = new StatisticsViewModel();

                // Calculate total activities
                statistics.TotalActivities = await _context.Activities.CountAsync();

                // Calculate total users
                statistics.TotalUsers = await _context.Users.CountAsync(); // Assuming Users is your DbSet<AppUser>

                // Calculate total comments
                statistics.TotalComments = await _context.Comments.CountAsync();

                // Calculate total photos
                statistics.TotalPhotos = await _context.Photos.CountAsync();

                // Calculate average rating
                var averageRating = await _context.Ratings
                    .AverageAsync(r => (double?)r.Value) ?? 0;
                statistics.AverageRating = averageRating;

                // Calculate average tickets per activity
                var activitiesWithTickets = await _context.Activities
                    .Include(a => a.Tickets)
                    .Where(a => a.Tickets.Any())
                    .ToListAsync();
                statistics.AverageTicketsPerActivity = activitiesWithTickets.Any()
                    ? activitiesWithTickets.Average(a => a.Tickets.Count)
                    : 0;

                // Calculate category frequency
                var categoryCounts = await _context.Activities
                    .GroupBy(a => a.Category)
                    .Select(g => new { Category = g.Key, Count = g.Count() })
                    .OrderByDescending(g => g.Count)
                    .ToListAsync();
                statistics.CategoryCounts = categoryCounts.Select(c => new CategoryCountViewModel
                {
                    Category = c.Category,
                    Count = c.Count
                }).ToList();

                // Calculate comment counts per category
                var commentCounts = await _context.Activities
                    .SelectMany(a => a.Comments)
                    .GroupBy(c => c.Activity.Category)
                    .Select(g => new { Category = g.Key, Count = g.Count() })
                    .ToListAsync();
                statistics.CommentCountsPerCategory = commentCounts.Select(c => new CategoryCountViewModel
                {
                    Category = c.Category,
                    Count = c.Count
                }).ToList();

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                // Log the exception for troubleshooting purposes
                Console.WriteLine($"Error in GetStatistics: {ex}");

                // Return a 500 Internal Server Error response
                return StatusCode(500, new { Error = "An error occurred while retrieving statistics." });
            }
        }
    }
}
