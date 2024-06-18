using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class StripeSession
    {
        public int Id { get; set; }
        public string SessionId { get; set; }
        public string CustomerEmail { get; set; }
        public string PaymentIntentId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}