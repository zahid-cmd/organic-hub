using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.AccountSetup;

namespace OrganicHub.Api.Controllers.AccountSetup
{
    [ApiController]
    [Route("api/general-ledgers")]
    public class GeneralLedgersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GeneralLedgersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.GeneralLedgers
                .Include(l => l.AccountSubGroup)
                    .ThenInclude(s => s.AccountGroup)
                .OrderBy(l => l.LedgerCode)
                .ToListAsync();

            return Ok(data);
        }

        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.GeneralLedgers
                .Include(l => l.AccountSubGroup)
                    .ThenInclude(s => s.AccountGroup)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(GeneralLedger model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            model.CreatedDate = DateTime.UtcNow;
            model.UpdatedDate = null;
            model.IsDeleted = false;

            _context.GeneralLedgers.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new { message = "General Ledger created successfully." });
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, GeneralLedger model)
        {
            var existing = await _context.GeneralLedgers.FindAsync(id);

            if (existing == null)
                return NotFound();

            existing.LedgerName = model.LedgerName;
            existing.SubGroupId = model.SubGroupId;
            existing.Status = model.Status;
            existing.Remarks = model.Remarks;
            existing.UpdatedBy = model.UpdatedBy;
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "General Ledger updated successfully." });
        }

        // =====================================================
        // DELETE (SOFT DELETE)
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.GeneralLedgers.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "General Ledger deleted successfully." });
        }

        // =====================================================
        // GET NEXT LEDGER CODE
        // =====================================================
        [HttpGet("next-code/{subGroupId}")]
        public async Task<IActionResult> GetNextCode(int subGroupId)
        {
            var subGroup = await _context.AccountSubGroups
                .FirstOrDefaultAsync(s => s.Id == subGroupId);

            if (subGroup == null)
                return BadRequest("Invalid sub-group.");

            var lastLedger = await _context.GeneralLedgers
                .Where(l => l.SubGroupId == subGroupId)
                .OrderByDescending(l => l.Id)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (lastLedger != null)
            {
                var parts = lastLedger.LedgerCode.Split('-');
                if (parts.Length > 0 && int.TryParse(parts.Last(), out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }

            // 🔥 ONLY CHANGE HERE
            // Replace GRP with GL
            string subGroupCodeWithoutPrefix = subGroup.SubGroupCode;

            if (subGroupCodeWithoutPrefix.StartsWith("GRP-"))
            {
                subGroupCodeWithoutPrefix =
                    subGroupCodeWithoutPrefix.Replace("GRP-", "GL-");
            }

            string nextCode = $"{subGroupCodeWithoutPrefix}-{nextNumber:D4}";

            return Ok(nextCode);
        }
    }
}