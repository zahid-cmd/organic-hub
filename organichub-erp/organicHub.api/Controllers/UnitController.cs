using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models;

namespace OrganicHub.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UnitController : ControllerBase
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

            var exists = await _context.Units
                .AnyAsync(u => u.UnitCode == unit.UnitCode);

            if (exists)
                return BadRequest(new { message = "Unit Code already exists." });

            unit.Id = 0;
            unit.CreatedBy = "System";
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

            var exists = await _context.Units
                .AnyAsync(u => u.UnitCode == updatedUnit.UnitCode && u.Id != id);

            if (exists)
                return BadRequest(new { message = "Unit Code already exists." });

            unit.UnitCode = updatedUnit.UnitCode;
            unit.UnitName = updatedUnit.UnitName;
            unit.Status = updatedUnit.Status;
            unit.Remarks = updatedUnit.Remarks;
            unit.UpdatedBy = "System";
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
            var unit = await _context.Units.FindAsync(id);

            if (unit == null)
                return NotFound(new { message = "Unit not found." });

            _context.Units.Remove(unit);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Unit deleted successfully." });
        }
    }
}
