using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.AccountSetup;

namespace OrganicHub.Api.Controllers.AccountSetup
{
    [ApiController]
    [Route("api/account-subgroups")]
    public class AccountSubGroupsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccountSubGroupsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.AccountSubGroups
                .Include(s => s.AccountGroup)
                .ThenInclude(g => g.AccountClass)
                .OrderBy(s => s.SubGroupCode)
                .ToListAsync();

            return Ok(data);
        }

        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.AccountSubGroups
                .Include(s => s.AccountGroup)
                .ThenInclude(g => g.AccountClass)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(AccountSubGroup model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            model.CreatedDate = DateTime.UtcNow;
            model.UpdatedDate = null;
            model.IsDeleted = false;

            _context.AccountSubGroups.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account Sub-Group created successfully." });
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, AccountSubGroup model)
        {
            var existing = await _context.AccountSubGroups.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.SubGroupName = model.SubGroupName;
            existing.GroupId = model.GroupId;
            existing.Status = model.Status;
            existing.Remarks = model.Remarks;
            existing.UpdatedBy = model.UpdatedBy;
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Account Sub-Group updated successfully." });
        }

        // =====================================================
        // DELETE (SOFT DELETE)
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.AccountSubGroups.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account Sub-Group deleted successfully." });
        }

        // =====================================================
        // GET NEXT SUB GROUP CODE
        // =====================================================
        [HttpGet("next-code/{groupId}")]
        public async Task<IActionResult> GetNextCode(int groupId)
        {
            var group = await _context.AccountGroups
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null)
                return BadRequest("Invalid group.");

            // Find last sub-group for this group
            var lastSubGroup = await _context.AccountSubGroups
                .Where(s => s.GroupId == groupId)
                .OrderByDescending(s => s.Id)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (lastSubGroup != null)
            {
                var parts = lastSubGroup.SubGroupCode.Split('-');
                if (parts.Length > 0 && int.TryParse(parts.Last(), out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }

            // 🔥 Replace GRP prefix with SUB
            string groupCodeForSub = group.GroupCode;

            if (groupCodeForSub.StartsWith("GRP-"))
            {
                groupCodeForSub = groupCodeForSub.Replace("GRP-", "SUB-");
            }

            string nextCode = $"{groupCodeForSub}-{nextNumber:D3}";

            return Ok(nextCode);
        }
    }
}