using Application.Comments;
using System;
using System.Collections.Generic;

namespace Application.Activities
{
    public class ActivityDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string City { get; set; }
        public string Venue { get; set; }
        public string HostUsername { get; set; }
        public bool IsCancelled { get; set; }
        public ICollection<AttendeeDto> Attendees { get; set; }
        public ICollection<CommentDto> Comments { get; set; }
        public double AverageRating { get; set; }
        public string TicketType { get; set; }
        public decimal TicketPrice { get; set; }
        public int TicketQuantitySold { get; set; }
        public int TicketQuantityAvailable { get; set; }
        public bool RequiresPayment { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
