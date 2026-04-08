using Microsoft.AspNetCore.Mvc;

namespace OrganicHubBackend.Controllers
{
    [ApiController]
    [Route("api/health")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetHealth()
        {
            return Ok(new
            {
                status = "OK",
                message = "Organic Hub backend is running"
            });
        }
    }
}
