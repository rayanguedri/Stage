using Domain;
public class Ticket
{
    public Guid Id { get; set; }
    public Guid ActivityId { get; set; }
    public Activity Activity { get; set; }
    public string Type { get; set; }
    public decimal Price { get; set; }
    public string PaymentIntentId { get; set; }
    public string Currency { get; set; }
    public string UserId { get; set; }
    public AppUser User { get; set; }
    public bool HasPurchased { get; set; }
}
