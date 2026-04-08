using Microsoft.AspNetCore.Mvc;

namespace OrganicHubBackend.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        [HttpGet("summary")]
        public IActionResult GetSummary()
        {
            var summary = new
            {
                totalSales = 7800000,
                totalPurchase = 4200000,
                inventoryValue = 5100000,
                cashPosition = 2700000
            };

            return Ok(summary);
        }
    }
}
