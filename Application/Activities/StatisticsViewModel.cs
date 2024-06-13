namespace Application.Activities
{
     public class StatisticsViewModel
    {
        public int TotalActivities { get; set; }
        public int TotalUsers { get; set; }
        public int TotalComments { get; set; }
        public int TotalPhotos { get; set; }
        public double AverageRating { get; set; }
        public double AverageTicketsPerActivity { get; set; }
        public List<CategoryCountViewModel> CategoryCounts { get; set; }
        public List<CategoryCountViewModel> CommentCountsPerCategory { get; set; }
        // Add more properties as needed
    }
}