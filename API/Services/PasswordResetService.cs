using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;


public interface IPasswordResetService
{
    Task GenerateAndSendResetTokenAsync(string userEmail);
    Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
}

public class PasswordResetService : IPasswordResetService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IEmailSender _emailSender;

    public PasswordResetService(UserManager<AppUser> userManager, IEmailSender emailSender)
    {
        _userManager = userManager;
        _emailSender = emailSender;
    }

    public async Task GenerateAndSendResetTokenAsync(string userEmail)
    {
        var user = await _userManager.FindByEmailAsync(userEmail);
        if (user == null)
            throw new ArgumentException("Invalid email address");

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);

        // Send email
        var resetLink = $"http://localhost:3000/reset-password?token={Uri.EscapeDataString(token)}&email={userEmail}";
        await _emailSender.SendEmailAsync(userEmail, "Password Reset", $"Click to reset your password: <a href=\"{resetLink}\">Reset Password</a>");
    }

    public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return false;

        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        return result.Succeeded;
    }
}
