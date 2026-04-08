using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.AccountSetup;
using OrganicHub.Api.DTOs.AccountSetup;

namespace OrganicHub.Api.Controllers.AccountSetup
{
    [ApiController]
    [Route("api/account-groups")]
    public class AccountGroupController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccountGroupController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var groups = await _context.AccountGroups
                .Include(g => g.AccountClass)
                .Where(g => !g.IsDeleted)
                .OrderBy(g => g.GroupCode)
                .ToListAsync();

            return Ok(groups);
        }
        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var group = await _context.AccountGroups
                .Include(g => g.AccountClass)
                .FirstOrDefaultAsync(g => g.Id == id && !g.IsDeleted);

            if (group == null)
                return NotFound(new { message = "Account group not found." });

            return Ok(group);
        }
        // =====================================================
        // PRIVATE: GET NEXT NUMBER PER CLASS
        // =====================================================
        private async Task<int> GetNextGroupNumber(int classId)
        {
            var lastGroupCode = await _context.AccountGroups
                .Where(g => g.AccountClassId == classId && !g.IsDeleted)
                .OrderByDescending(g => g.Id)
                .Select(g => g.GroupCode)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (!string.IsNullOrEmpty(lastGroupCode))
            {
                var parts = lastGroupCode.Split('-');

                if (int.TryParse(parts.Last(), out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }

            return nextNumber;
        }

        // =====================================================
        // GET NEXT CODE
        // =====================================================
        [HttpGet("next-code/{classId}")]
        public async Task<ActionResult<string>> GetNextCode(int classId)
        {
            var classCode = await _context.AccountClasses
                .Where(c => c.Id == classId && !c.IsDeleted)
                .Select(c => c.ClassCode)
                .FirstOrDefaultAsync();

            if (classCode == null)
                return NotFound(new { message = "Class not found." });

            // Extract numeric part from CLS-01 → 01
            string classNumber = classCode.Substring(4);

            int nextNumber = await GetNextGroupNumber(classId);

            string newCode = $"GRP-{classNumber}-{nextNumber:D2}";

            return Ok(newCode);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<ActionResult> Create(AccountGroupCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.GroupName))
                return BadRequest(new { message = "Group Name is required." });

            var classCode = await _context.AccountClasses
                .Where(c => c.Id == dto.AccountClassId && !c.IsDeleted)
                .Select(c => c.ClassCode)
                .FirstOrDefaultAsync();

            if (classCode == null)
                return BadRequest(new { message = "Invalid Account Class." });

            string classNumber = classCode.Substring(4);

            int nextNumber = await GetNextGroupNumber(dto.AccountClassId);

            var model = new AccountGroup
            {
                GroupCode = $"GRP-{classNumber}-{nextNumber:D2}",
                GroupName = dto.GroupName.Trim(),
                AccountClassId = dto.AccountClassId,
                Status = dto.Status ?? "Active",
                Remarks = dto.Remarks,
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.AccountGroups.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account group created successfully." });
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, AccountGroupCreateDto dto)
        {
            var existing = await _context.AccountGroups
                .FirstOrDefaultAsync(g => g.Id == id && !g.IsDeleted);

            if (existing == null)
                return NotFound(new { message = "Account group not found." });

            if (string.IsNullOrWhiteSpace(dto.GroupName))
                return BadRequest(new { message = "Group Name is required." });

            existing.GroupName = dto.GroupName.Trim();
            existing.AccountClassId = dto.AccountClassId;
            existing.Status = dto.Status ?? existing.Status;
            existing.Remarks = dto.Remarks;
            existing.UpdatedBy = "System";
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Account group updated successfully." });
        }

        // =====================================================
        // DELETE (SOFT DELETE)
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var existing = await _context.AccountGroups
                .FirstOrDefaultAsync(g => g.Id == id && !g.IsDeleted);

            if (existing == null)
                return NotFound(new { message = "Account group not found." });

            existing.IsDeleted = true;
            existing.UpdatedBy = "System";
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Account group deleted successfully." });
        }



    }
}