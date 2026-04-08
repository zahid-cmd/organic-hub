using Microsoft.AspNetCore.Mvc;

namespace OrganicHubBackend.Controllers
{
    [ApiController]
    [Route("api/ping")]
    public class PingController : ControllerBase
    {
        [HttpGet]
        public IActionResult Ping([FromQuery] string message)
        {
            return Ok(new
            {
                received = message,
                serverTime = DateTime.UtcNow
            });
        }
    }
}
