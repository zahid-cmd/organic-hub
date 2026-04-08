using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.ProductManagement;
using OrganicHub.Api.Controllers.Base;

namespace OrganicHub.Api.Controllers.ProductManagement
{
    [Route("api/[controller]")]
    public class UnitController : ErpControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UnitController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Unit>>> GetAll()
        {
            var units = await _context.Units
                .AsNoTracking()
                .OrderBy(u => u.UnitName)
                .ToListAsync();

            return Ok(units);
        }

        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id}")]
        public async Task<ActionResult<Unit>> GetById(int id)
        {
            var unit = await _context.Units
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id);

            if (unit == null)
                return NotFound(new { message = "Unit not found." });

            return Ok(unit);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Unit unit)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(unit.UnitCode))
                return BadRequest(new { message = "Unit Code is required." });

            if (string.IsNullOrWhiteSpace(unit.UnitName))
                return BadRequest(new { message = "Unit Name is required." });

            var trimmedCode = unit.UnitCode.Trim();
            var trimmedName = unit.UnitName.Trim();

            var exists = await _context.Units
                .AnyAsync(u => u.UnitCode == trimmedCode);

            if (exists)
                return BadRequest(new { message = "Unit Code already exists." });

            unit.Id = 0;
            unit.UnitCode = trimmedCode;
            unit.UnitName = trimmedName;
            unit.Status = string.IsNullOrWhiteSpace(unit.Status)
                                ? "Active"
                                : unit.Status.Trim();
            unit.CreatedBy = CurrentUsername;
            unit.CreatedDate = DateTime.UtcNow;

            _context.Units.Add(unit);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Unit created successfully.",
                data = unit
            });
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Unit updatedUnit)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var unit = await _context.Units.FindAsync(id);

            if (unit == null)
                return NotFound(new { message = "Unit not found." });

            if (string.IsNullOrWhiteSpace(updatedUnit.UnitCode))
                return BadRequest(new { message = "Unit Code is required." });

            if (string.IsNullOrWhiteSpace(updatedUnit.UnitName))
                return BadRequest(new { message = "Unit Name is required." });

            var trimmedCode = updatedUnit.UnitCode.Trim();
            var trimmedName = updatedUnit.UnitName.Trim();

            var exists = await _context.Units
                .AnyAsync(u => u.UnitCode == trimmedCode && u.Id != id);

            if (exists)
                return BadRequest(new { message = "Unit Code already exists." });

            unit.UnitCode = trimmedCode;
            unit.UnitName = trimmedName;
            unit.Status = string.IsNullOrWhiteSpace(updatedUnit.Status)
                                ? "Active"
                                : updatedUnit.Status.Trim();
            unit.Remarks = updatedUnit.Remarks;
            unit.UpdatedBy = CurrentUsername;
            unit.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Unit updated successfully.",
                data = unit
            });
        }

        // =====================================================
        // DELETE
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var unit = await _context.Units
                .Include(u => u.Products)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (unit == null)
                return NotFound(new { message = "Unit not found." });

            if (unit.Products != null && unit.Products.Any())
                return BadRequest(new { message = "Cannot delete Unit linked with products." });

            _context.Units.Remove(unit);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Unit deleted successfully." });
        }
    }
}