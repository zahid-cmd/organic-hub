using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Controllers.Base;

namespace OrganicHub.Api.Controllers
{
    [Route("api/[controller]")]
    public class DashboardController : ErpControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // DASHBOARD SUMMARY (ERP ONLY)
        // =====================================================
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var totalProducts = await _context.Products
                .Where(p => !p.IsDeleted)
                .CountAsync();

            var totalCategories = await _context.Categories.CountAsync();

            var totalSubCategories = await _context.SubCategories.CountAsync();

            var totalUnits = await _context.Units.CountAsync();

            var totalProductTypes = await _context.ProductTypes.CountAsync();

            return Ok(new
            {
                totalProducts,
                totalCategories,
                totalSubCategories,
                totalUnits,
                totalProductTypes
            });
        }
    }
}