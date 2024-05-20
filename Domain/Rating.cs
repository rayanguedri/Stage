

namespace Domain
{
    public class Rating
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; } 
        public Guid ActivityId { get; set; } 
        public int Value { get; set; }
        public Activity Activity { get; set; }
    }
}
