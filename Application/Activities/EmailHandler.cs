using System;
using System.Net;
using System.Net.Mail;

public class EmailHandler
{
    public void SendEmail(string recipient, string subject, string body)
    {
        try
        {
            // Replace placeholders with your email address and password
            string senderEmail = "maamartin50@gmail.com";
            string senderPassword = "Azqswx123";

            // Configure SMTP client
            using (SmtpClient smtpClient = new SmtpClient("smtp.gmail.com"))
            {
                smtpClient.Port = 587; // SMTP port (e.g., 587 for TLS)
                smtpClient.UseDefaultCredentials = false;
                smtpClient.EnableSsl = true; // Enable SSL/TLS encryption
                smtpClient.Credentials = new NetworkCredential(senderEmail, senderPassword);

                // Create and configure email message
                MailMessage mailMessage = new MailMessage();
                mailMessage.From = new MailAddress(senderEmail);
                mailMessage.To.Add(recipient);
                mailMessage.Subject = subject;
                mailMessage.Body = body;
                mailMessage.IsBodyHtml = true;
               
                

                // Send email
                smtpClient.Send(mailMessage);


                Console.WriteLine("Email sent successfully.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("An error occurred while sending the email: " + ex.Message);
        }
    }
}
