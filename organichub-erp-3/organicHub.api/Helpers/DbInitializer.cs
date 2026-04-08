using OrganicHub.Api.Data;
using OrganicHub.Api.Models.Auth;

namespace OrganicHub.Api.Helpers
{
    public static class DbInitializer
    {
        public static void SeedAdminUser(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var adminExists = context.Users.Any(u => u.Username == "admin");

            if (!adminExists)
            {
                var adminUser = new User
                {
                    Username = "admin",
                    Email = "admin@organichub.com",
                    PasswordHash = PasswordHasher.Hash("Admin123!"),
                    Role = "Admin",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.Add(adminUser);
                context.SaveChanges();
            }
        }
    }
}