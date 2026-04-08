using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using OrganicHub.Api.Data;
using OrganicHub.Api.DTOs.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace OrganicHub.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // ==============================
        // LOGIN (Allowed Without Token)
        // ==============================
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid request.");

            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Password))
                return BadRequest("Username and Password are required.");

            var normalizedUsername = request.Username.Trim().ToLower();

            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Username.ToLower() == normalizedUsername &&
                    u.IsActive);

            if (user == null)
                return Unauthorized("Invalid username or password.");

            var isPasswordValid =
                Helpers.PasswordHasher.Verify(request.Password, user.PasswordHash);

            if (!isPasswordValid)
                return Unauthorized("Invalid username or password.");

            var token = GenerateJwtToken(user);

            return Ok(new LoginResponse
            {
                Token = token,
                Username = user.Username,
                Role = user.Role
            });
        }

        // ==============================
        // JWT GENERATOR
        // ==============================
        private string GenerateJwtToken(Models.Auth.User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");

            var secretKey = _configuration["JwtSettings:SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];
            var expiryMinutesStr = jwtSettings["ExpiryMinutes"];

            if (string.IsNullOrWhiteSpace(secretKey))
                throw new Exception("JWT SecretKey is not configured.");

            if (!int.TryParse(expiryMinutesStr, out int expiryMinutes))
                expiryMinutes = 60;

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("UserId", user.Id.ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey)
            );

            var creds = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}