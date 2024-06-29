using System.Security.Claims;
using System.Text;
using API.DTOs;
using API.Services;
using Domain;
using Infrastructure.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly TokenService _tokenService;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly EmailSender _emailSender;

        public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, TokenService tokenService, EmailSender emailSender)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _emailSender = emailSender;
        }

        [HttpGet("listUsers")]
        public async Task<ActionResult<List<UserDto>>> ListUsers()
        {
            var users = await _userManager.Users
                .Include(p => p.Photos)
                .Select(user => new UserDto
                {
                    DisplayName = user.DisplayName,
                    Username = user.UserName,
                    Email = user.Email,
                    Bio = user.Bio,
                    Image = user.Photos.FirstOrDefault(x => x.IsMain) != null
                            ? user.Photos.FirstOrDefault(x => x.IsMain).Url
                            : null,
                    ActivitiesCount = user.Activities.Count,
                    FollowersCount = user.Followers.Count,
                    FollowingsCount = user.Followings.Count,
                     IsBanned = user.IsBanned 
                })
                .ToListAsync();

            return Ok(users);
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.Users.Include(p => p.Photos)
                .FirstOrDefaultAsync(x => x.Email == loginDto.Email);

            if (user == null) return Unauthorized("Invalid Email");

            if (user.UserName == "bob") user.EmailConfirmed = true; // test kahaw na7eha mba3d
            if (user.UserName == "tom") user.EmailConfirmed = true; // test kahaw na7eha mba3d
            if (user.UserName == "jane") user.EmailConfirmed = true; // test kahaw na7eha mba3d


            if (user.IsBanned) return Unauthorized("This account has been banned");

            if (!user.EmailConfirmed) return Unauthorized("Email not confirmed");


            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (result.Succeeded)
            {
                return CreateUserObject(user);
            }

            return Unauthorized("Invalid Password");
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await _userManager.Users.AnyAsync(x => x.UserName == registerDto.Username))
            {
                ModelState.AddModelError("username", "Username taken");
                return ValidationProblem();
            }

            if (await _userManager.Users.AnyAsync(x => x.Email == registerDto.Email))
            {
                ModelState.AddModelError("email", "Email taken");
                return ValidationProblem();
            }

            var user = new AppUser
            {
                DisplayName = registerDto.DisplayName,
                Email = registerDto.Email,
                UserName = registerDto.Username
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded) return BadRequest("Problem registering user");

            var origin = Request.Headers["origin"];
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var verifyUrl = $"{origin}/account/verifyEmail?token={token}&email={user.Email}";
            var message = $"<p>Please click the below link to verify your email address:</p><p><a href='{verifyUrl}'>'Click to verify email'</a></p>";
            await _emailSender.SendEmailAsync(user.Email, "Please verify email", message);

            return Ok("Registration successful - please verify email");
        }

        [AllowAnonymous]
        [HttpPost("verifyEmail")]
        public async Task<ActionResult> VerifyEmail(string token, string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null) return Unauthorized();

            var decodedTokenBytes = WebEncoders.Base64UrlDecode(token);
            var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);
            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if (!result.Succeeded) return BadRequest("Could not verify email address");

            return Ok("Email confirmed - you can now login");
        }

        [AllowAnonymous]
        [HttpGet("resendEmailConfirmationLink")]
        public async Task<IActionResult> ResendEmailConfirmationLink(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null) return Unauthorized();

            var origin = Request.Headers["origin"];
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var verifyUrl = $"{origin}/account/verifyEmail?token={token}&email={user.Email}";
            var message = $"<p>Please click the below link to verify your email address:</p><p><a href='{verifyUrl}'>'Click to verify email'</a></p>";

            await _emailSender.SendEmailAsync(email, "Please verify email", message);

            return Ok("email verification link resent");
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var user = await _userManager.Users.Include(p => p.Photos)
                .FirstOrDefaultAsync(x => x.Email == User.FindFirstValue(ClaimTypes.Email));

            return CreateUserObject(user);
        }

        private UserDto CreateUserObject(AppUser user)
        {
            return new UserDto
            {
                DisplayName = user.DisplayName,
                Image = user?.Photos?.FirstOrDefault(x => x.IsMain)?.Url,
                Token = _tokenService.CreateToken(user),
                Username = user.UserName
            };
        }

        [AllowAnonymous]
        [HttpPost("forgotPassword")]
        public async Task<IActionResult> ForgotPassword(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return BadRequest("User with this email does not exist.");
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            // Encode the token as Base64
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var origin = Request.Headers["origin"];
            var resetUrl = $"{origin}/reset-password/{encodedToken}";

            var message = $"<p>Please click the below link to reset your password:</p><p><a href='{resetUrl}'>Click to reset password</a></p>";
            await _emailSender.SendEmailAsync(email, "Reset Password", message);

            return Ok("Password reset link sent");
        }

        [AllowAnonymous]
        [HttpPost("resetPassword")]
        public async Task<IActionResult> ResetPassword(string token, string email, string newPassword)
        {
            if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(email))
            {
                return BadRequest("Token or email is missing.");
            }

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return BadRequest("User not found for the given email.");
            }

            // Decode the token
            var decodedTokenBytes = WebEncoders.Base64UrlDecode(token);
            var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

            var result = await _userManager.ResetPasswordAsync(user, decodedToken, newPassword);
            if (!result.Succeeded)
            {
                return BadRequest("Failed to reset password.");
            }

            return Redirect("/login");
        }
        [HttpPost("banUser")]
        public async Task<IActionResult> BanUser(UserDto userDto)
        {
            var user = await _userManager.FindByNameAsync(userDto.Username);
            if (user == null)
            {
                return NotFound("User not found");
            }

            user.IsBanned = true;  // Set the user as banned
            await _userManager.UpdateAsync(user);

            // You may want to log out the user if they are currently logged in
            await _signInManager.SignOutAsync();

            return Ok("User banned successfully");
        }

        [HttpPost("unbanUser")]
        public async Task<IActionResult> UnbanUser(UserDto userDto)
        {
            var user = await _userManager.FindByNameAsync(userDto.Username);
            if (user == null)
            {
                return NotFound("User not found");
            }

            user.IsBanned = false;  // Unban the user
            await _userManager.UpdateAsync(user);

            return Ok("User unbanned successfully");
        }
    }


}
