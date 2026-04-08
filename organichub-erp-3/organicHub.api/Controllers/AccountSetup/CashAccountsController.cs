using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.AccountSetup;
using OrganicHub.Api.DTOs.AccountSetup;
using OrganicHub.Api.Models.GeneralSetup;

namespace OrganicHub.Api.Controllers.AccountSetup
{
    [ApiController]
    [Route("api/cash-accounts")]
    public class CashAccountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CashAccountsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.CashAccounts
                .Include(c => c.Branch)
                .Include(c => c.AccountSubGroup)
                .Where(c => !c.IsDeleted)
                .OrderBy(c => c.AccountCode)
                .ToListAsync();

            return Ok(data);
        }

        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.CashAccounts
                .Include(c => c.Branch)
                .Include(c => c.AccountSubGroup)
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (item == null)
                return NotFound("Cash Account not found.");

            return Ok(item);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(CreateCashAccountDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            const string fixedSubGroupCode = "SUB-01-03-001";

            var subGroup = await _context.AccountSubGroups
                .FirstOrDefaultAsync(s => s.SubGroupCode == fixedSubGroupCode);

            if (subGroup == null)
                return BadRequest("Cash Account SubGroup (SUB-01-03-001) not configured.");

            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.Id == dto.BranchId);

            if (branch == null)
                return BadRequest("Invalid branch.");

            var entity = new CashAccount
            {
                AccountCode = dto.AccountCode,
                AccountName = dto.AccountName.Trim(),
                BranchId = dto.BranchId,
                SubGroupId = subGroup.Id,
                CashAccountName = $"{dto.AccountName.Trim()} - {branch.BranchName}",
                IsCollectionAccount = dto.IsCollectionAccount,
                IsPaymentAccount = dto.IsPaymentAccount,
                Status = dto.Status ?? "Active",
                Remarks = dto.Remarks,
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.CashAccounts.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cash Account created successfully." });
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateCashAccountDto dto)
        {
            var existing = await _context.CashAccounts
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (existing == null)
                return NotFound("Cash Account not found.");

            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.Id == dto.BranchId);

            if (branch == null)
                return BadRequest("Invalid branch.");

            existing.AccountName = dto.AccountName.Trim();
            existing.BranchId = dto.BranchId;
            existing.IsCollectionAccount = dto.IsCollectionAccount;
            existing.IsPaymentAccount = dto.IsPaymentAccount;
            existing.Status = dto.Status ?? "Active";
            existing.Remarks = dto.Remarks;
            existing.CashAccountName =
                $"{dto.AccountName.Trim()} - {branch.BranchName}";
            existing.UpdatedBy = "System";
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cash Account updated successfully." });
        }

        // =====================================================
        // DELETE (SOFT)
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.CashAccounts
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (existing == null)
                return NotFound("Cash Account not found.");

            existing.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cash Account deleted successfully." });
        }

        // =====================================================
        // GET NEXT CASH ACCOUNT CODE
        // FORMAT: CA-01-03-001-0001
        // =====================================================
        [HttpGet("next-code")]
        public async Task<IActionResult> GetNextCode()
        {
            const string fixedSubGroupCode = "SUB-01-03-001";

            var subGroup = await _context.AccountSubGroups
                .FirstOrDefaultAsync(s => s.SubGroupCode == fixedSubGroupCode);

            if (subGroup == null)
                return BadRequest("Cash Account SubGroup (SUB-01-03-001) not configured.");

            var codes = await _context.CashAccounts
                .Where(c => c.SubGroupId == subGroup.Id)
                .Select(c => c.AccountCode)
                .ToListAsync();

            int nextNumber = 1;

            if (codes.Any())
            {
                nextNumber = codes
                    .Select(code =>
                    {
                        var parts = code.Split('-');
                        if (parts.Length > 0 &&
                            int.TryParse(parts.Last(), out int num))
                            return num;
                        return 0;
                    })
                    .Max() + 1;
            }

            string codePart = fixedSubGroupCode.Replace("SUB-", "");

            string nextCode =
                $"CA-{codePart}-{nextNumber:D4}";

            return Ok(nextCode);
        }
    }
}