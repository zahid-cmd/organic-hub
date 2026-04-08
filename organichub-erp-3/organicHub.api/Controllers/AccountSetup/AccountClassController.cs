using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.AccountSetup;
using OrganicHub.Api.DTOs.AccountSetup;

namespace OrganicHub.Api.Controllers.AccountSetup
{
    [ApiController]
    [Route("api/account-classes")]
    public class AccountClassController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccountClassController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL (EXCLUDE DELETED)
        // =====================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccountClass>>> GetAll()
        {
            var classes = await _context.AccountClasses
                .Where(a => !a.IsDeleted)
                .OrderBy(a => a.ClassCode)
                .ToListAsync();

            return Ok(classes);
        }

        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id}")]
        public async Task<ActionResult<AccountClass>> GetById(int id)
        {
            var accountClass = await _context.AccountClasses
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);

            if (accountClass == null)
                return NotFound(new { message = "Account class not found." });

            return Ok(accountClass);
        }

        // =====================================================
        // PRIVATE: GET NEXT NUMBER
        // =====================================================
        private async Task<int> GetNextClassNumber()
        {
            var lastCode = await _context.AccountClasses
                .Where(a => !a.IsDeleted)
                .OrderByDescending(a => a.Id)
                .Select(a => a.ClassCode)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (!string.IsNullOrEmpty(lastCode) &&
                lastCode.StartsWith("CLS-") &&
                int.TryParse(lastCode.Substring(4), out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }

            return nextNumber;
        }

        // =====================================================
        // GET NEXT CODE
        // =====================================================
        [HttpGet("next-code")]
        public async Task<ActionResult<string>> GetNextCode()
        {
            int nextNumber = await GetNextClassNumber();

            // 🔥 CHANGED FROM D3 TO D2
            string newCode = $"CLS-{nextNumber:D2}";

            return Ok(newCode);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<ActionResult> Create(AccountClassCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ClassName))
                return BadRequest(new { message = "Class Name is required." });

            if (string.IsNullOrWhiteSpace(dto.ClassMode))
                return BadRequest(new { message = "Class Mode is required." });

            int nextNumber = await GetNextClassNumber();

            var model = new AccountClass
            {
                // 🔥 CHANGED FROM D3 TO D2
                ClassCode = $"CLS-{nextNumber:D2}",
                ClassName = dto.ClassName.Trim(),
                ClassMode = dto.ClassMode.Trim(),
                Status = dto.Status ?? "Active",
                Remarks = dto.Remarks,
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.AccountClasses.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account class created successfully." });
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, AccountClassCreateDto dto)
        {
            var existing = await _context.AccountClasses
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);

            if (existing == null)
                return NotFound(new { message = "Account class not found." });

            existing.ClassName = dto.ClassName?.Trim();
            existing.ClassMode = dto.ClassMode?.Trim();
            existing.Status = dto.Status ?? existing.Status;
            existing.Remarks = dto.Remarks;
            existing.UpdatedBy = "System";
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Account class updated successfully." });
        }

        // =====================================================
        // DELETE (SOFT DELETE)
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var existing = await _context.AccountClasses
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);

            if (existing == null)
                return NotFound(new { message = "Account class not found." });

            existing.IsDeleted = true;
            existing.UpdatedBy = "System";
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Account class deleted successfully." });
        }
    }
}