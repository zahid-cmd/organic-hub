using BCrypt.Net;

namespace OrganicHub.Api.Helpers
{
    public static class PasswordHasher
    {
        public static string Hash(string password)
        {
            // Force enhanced hash version
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 11);
        }

        public static bool Verify(string password, string hash)
        {
            // Normalize prefix before verify
            if (hash.StartsWith("$2a$"))
            {
                hash = "$2b$" + hash.Substring(4);
            }

            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
    }
}