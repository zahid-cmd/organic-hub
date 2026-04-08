using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.AccountSetup;
using OrganicHub.Api.DTOs.AccountSetup;

namespace OrganicHub.Api.Controllers.AccountSetup
{
    [ApiController]
    [Route("api/pos-accounts")]
    public class PosAccountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PosAccountsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL (CLEAN LIST PROJECTION)
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.PosAccounts
                .Include(p => p.Branch)
                .Include(p => p.LinkedBankAccount)   // ✅ IMPORTANT
                .Where(p => !p.IsDeleted)
                .OrderBy(p => p.AccountCode)
                .Select(p => new
                {
                    id = p.Id,
                    accountCode = p.AccountCode,
                    accountName = p.AccountName,
                    terminalOrMerchantId = p.TerminalOrMerchantId,

                    branchId = p.BranchId,
                    branchName = p.Branch != null ? p.Branch.BranchName : "",

                    linkedBankAccountId = p.LinkedBankAccountId,
                    linkedBankAccountName = p.LinkedBankAccount != null
                        ? p.LinkedBankAccount.AccountName
                        : "",

                    isCollectionAccount = p.IsCollectionAccount,
                    isPaymentAccount = p.IsPaymentAccount,
                    status = p.Status
                })
                .ToListAsync();

            return Ok(data);
        }

        // =====================================================
        // GET BY ID (FLAT RESPONSE)
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.PosAccounts
                .Where(p => p.Id == id && !p.IsDeleted)
                .Select(p => new
                {
                    id = p.Id,
                    accountCode = p.AccountCode,
                    terminalOrMerchantId = p.TerminalOrMerchantId,
                    branchId = p.BranchId,
                    linkedBankAccountId = p.LinkedBankAccountId,
                    isCollectionAccount = p.IsCollectionAccount,
                    isPaymentAccount = p.IsPaymentAccount,
                    status = p.Status,
                    remarks = p.Remarks,
                    createdBy = p.CreatedBy,
                    createdDate = p.CreatedDate,
                    updatedBy = p.UpdatedBy,
                    updatedDate = p.UpdatedDate
                })
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        // =====================================================
        // CREATE
        // Fixed SubGroup: SUB-01-06-001
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(CreatePosAccountDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!dto.IsCollectionAccount && !dto.IsPaymentAccount)
                return BadRequest("Select Collection or Payment.");

            const string fixedSubGroupCode = "SUB-01-06-001";

            var subGroup = await _context.AccountSubGroups
                .FirstOrDefaultAsync(s => s.SubGroupCode == fixedSubGroupCode);

            if (subGroup == null)
                return BadRequest("Fixed POS SubGroup not found.");

            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.Id == dto.BranchId);

            if (branch == null)
                return BadRequest("Invalid branch.");

            var bank = await _context.BankAccounts
                .FirstOrDefaultAsync(b =>
                    b.Id == dto.LinkedBankAccountId &&
                    b.BranchId == dto.BranchId &&
                    b.Status == "Active");

            if (bank == null)
                return BadRequest("Invalid linked bank account.");

            var terminal = dto.TerminalOrMerchantId.Trim().ToUpper();

            // Prevent duplicate terminal per branch
            var exists = await _context.PosAccounts
                .AnyAsync(p =>
                    p.BranchId == dto.BranchId &&
                    p.TerminalOrMerchantId == terminal &&
                    !p.IsDeleted);

            if (exists)
                return BadRequest("This Terminal already exists for this branch.");

            var ledgerName = $"POS-{terminal}";

            var entity = new PosAccount
            {
                AccountCode = dto.AccountCode,
                AccountName = ledgerName,
                TerminalOrMerchantId = terminal,
                BranchId = dto.BranchId,
                SubGroupId = subGroup.Id,
                LinkedBankAccountId = dto.LinkedBankAccountId,
                IsCollectionAccount = dto.IsCollectionAccount,
                IsPaymentAccount = dto.IsPaymentAccount,
                Status = dto.Status,
                Remarks = dto.Remarks,
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.PosAccounts.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { message = "POS Account created successfully." });
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreatePosAccountDto dto)
        {
            var existing = await _context.PosAccounts
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

            if (existing == null)
                return NotFound();

            if (!dto.IsCollectionAccount && !dto.IsPaymentAccount)
                return BadRequest("Select Collection or Payment.");

            var bank = await _context.BankAccounts
                .FirstOrDefaultAsync(b =>
                    b.Id == dto.LinkedBankAccountId &&
                    b.BranchId == existing.BranchId &&
                    b.Status == "Active");

            if (bank == null)
                return BadRequest("Invalid linked bank account.");

            var terminal = dto.TerminalOrMerchantId.Trim().ToUpper();

            var duplicate = await _context.PosAccounts
                .AnyAsync(p =>
                    p.Id != id &&
                    p.BranchId == existing.BranchId &&
                    p.TerminalOrMerchantId == terminal &&
                    !p.IsDeleted);

            if (duplicate)
                return BadRequest("This Terminal already exists for this branch.");

            existing.TerminalOrMerchantId = terminal;
            existing.AccountName = $"POS-{terminal}";
            existing.LinkedBankAccountId = dto.LinkedBankAccountId;
            existing.IsCollectionAccount = dto.IsCollectionAccount;
            existing.IsPaymentAccount = dto.IsPaymentAccount;
            existing.Status = dto.Status;
            existing.Remarks = dto.Remarks;
            existing.UpdatedBy = "System";
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "POS Account updated successfully." });
        }

        // =====================================================
        // DELETE (SOFT DELETE)
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.PosAccounts
                .FirstOrDefaultAsync(p => p.Id == id);

            if (existing == null)
                return NotFound();

            existing.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "POS Account deleted successfully." });
        }

        // =====================================================
        // NEXT CODE
        // FORMAT: POS-01-06-001-0001
        // =====================================================
        [HttpGet("next-code")]
        public async Task<IActionResult> GetNextCode()
        {
            const string fixedSubGroupCode = "SUB-01-06-001";

            var subGroup = await _context.AccountSubGroups
                .FirstOrDefaultAsync(s => s.SubGroupCode == fixedSubGroupCode);

            if (subGroup == null)
                return BadRequest("Fixed POS SubGroup not found.");

            var last = await _context.PosAccounts
                .Where(p => p.SubGroupId == subGroup.Id)
                .OrderByDescending(p => p.Id)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (last != null)
            {
                var parts = last.AccountCode.Split('-');
                if (int.TryParse(parts.Last(), out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }

            string codePart = fixedSubGroupCode.Replace("SUB-", "");
            string nextCode = $"POS-{codePart}-{nextNumber:D4}";

            return Ok(nextCode);
        }
    }
}