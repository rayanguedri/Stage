
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;


namespace Infrastructure.Email
{
    public class EmailSender
    {
        private readonly IConfiguration __config;
        public EmailSender(IConfiguration _config)
        {
            __config = _config;
        }
        public  async Task SendEmailAsync(string userEmail, string emailSubject, string msg)
        {
            var client = new SendGridClient(__config["SendGrid:Key"]);
            var message = new SendGridMessage
            {
                From = new EmailAddress("rayan.guedri@esprit.tn", __config["SendGrid:User"]),
                Subject = emailSubject,
                PlainTextContent = msg,
                HtmlContent = msg
            };
            message.AddTo(new EmailAddress(userEmail));
            message.SetClickTracking(false, false);
            await client.SendEmailAsync(message);
        } 
    }
}