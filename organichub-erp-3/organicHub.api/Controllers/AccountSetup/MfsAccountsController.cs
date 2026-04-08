using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.AccountSetup;
using OrganicHub.Api.DTOs.AccountSetup;

namespace OrganicHub.Api.Controllers.AccountSetup
{
    [ApiController]
    [Route("api/mfs-accounts")]
    public class MfsAccountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MfsAccountsController(ApplicationDbContext context)
        {
            _context = context;
        }


        // =====================================================
        // GET ALL (CLEAN PROJECTION FOR LIST PAGE)
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.MfsAccounts
                .Include(m => m.Branch)
                .Where(m => !m.IsDeleted)
                .OrderBy(m => m.AccountCode)
                .Select(m => new
                {
                    id = m.Id,
                    accountCode = m.AccountCode,
                    accountName = m.AccountName,
                    shortAccountName = m.ShortAccountName,
                    walletOrMerchantNumber = m.WalletOrMerchantNumber,
                    mfsLedgerName = m.MfsLedgerName,
                    branchId = m.BranchId,
                    branchName = m.Branch != null 
                        ? m.Branch.BranchName 
                        : "",
                    isCollectionAccount = m.IsCollectionAccount,
                    isPaymentAccount = m.IsPaymentAccount,
                    status = m.Status
                })
                .ToListAsync();

            return Ok(data);
        }

        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.MfsAccounts
                .Include(m => m.Branch)
                .Include(m => m.AccountSubGroup)
                .Include(m => m.LinkedBankAccount)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        // =====================================================
        // CREATE
        // Fixed SubGroup: SUB-01-05-001 (Cash With MFS)
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(CreateMfsAccountDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            const string fixedSubGroupCode = "SUB-01-05-001";

            var subGroup = await _context.AccountSubGroups
                .FirstOrDefaultAsync(s => s.SubGroupCode == fixedSubGroupCode);

            if (subGroup == null)
                return BadRequest("Fixed MFS SubGroup not found.");

            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.Id == dto.BranchId);

            if (branch == null)
                return BadRequest("Invalid branch.");

            // Validate Linked Bank Account (if provided)
            if (dto.LinkedBankAccountId.HasValue)
            {
                var bank = await _context.BankAccounts
                    .FirstOrDefaultAsync(b =>
                        b.Id == dto.LinkedBankAccountId.Value &&
                        b.BranchId == dto.BranchId &&
                        b.Status == "Active");

                if (bank == null)
                    return BadRequest("Invalid linked bank account.");
            }

            var entity = new MfsAccount
            {
                AccountCode = dto.AccountCode,
                AccountName = dto.AccountName,
                ShortAccountName = dto.ShortAccountName,
                WalletOrMerchantNumber = dto.WalletOrMerchantNumber,
                MfsLedgerName =
                    $"{dto.ShortAccountName} - {dto.WalletOrMerchantNumber}",
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

            _context.MfsAccounts.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { message = "MFS Account created successfully." });
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateMfsAccountDto dto)
        {
            var existing = await _context.MfsAccounts
                .FirstOrDefaultAsync(m => m.Id == id);

            if (existing == null)
                return NotFound();

            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.Id == dto.BranchId);

            if (branch == null)
                return BadRequest("Invalid branch.");

            // Validate Linked Bank Account (if provided)
            if (dto.LinkedBankAccountId.HasValue)
            {
                var bank = await _context.BankAccounts
                    .FirstOrDefaultAsync(b =>
                        b.Id == dto.LinkedBankAccountId.Value &&
                        b.BranchId == dto.BranchId &&
                        b.Status == "Active");

                if (bank == null)
                    return BadRequest("Invalid linked bank account.");
            }

            existing.AccountName = dto.AccountName;
            existing.ShortAccountName = dto.ShortAccountName;
            existing.WalletOrMerchantNumber = dto.WalletOrMerchantNumber;
            existing.MfsLedgerName =
                $"{dto.ShortAccountName} - {dto.WalletOrMerchantNumber}";
            existing.BranchId = dto.BranchId;
            existing.LinkedBankAccountId = dto.LinkedBankAccountId;
            existing.IsCollectionAccount = dto.IsCollectionAccount;
            existing.IsPaymentAccount = dto.IsPaymentAccount;
            existing.Status = dto.Status;
            existing.Remarks = dto.Remarks;
            existing.UpdatedBy = "System";
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "MFS Account updated successfully." });
        }

        // =====================================================
        // DELETE (SOFT DELETE)
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.MfsAccounts
                .FirstOrDefaultAsync(m => m.Id == id);

            if (existing == null)
                return NotFound();

            existing.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "MFS Account deleted successfully." });
        }

        // =====================================================
        // GET NEXT CODE
        // FORMAT: MFS-01-05-001-0001
        // =====================================================
        [HttpGet("next-code")]
        public async Task<IActionResult> GetNextCode()
        {
            const string fixedSubGroupCode = "SUB-01-05-001";

            var subGroup = await _context.AccountSubGroups
                .FirstOrDefaultAsync(s => s.SubGroupCode == fixedSubGroupCode);

            if (subGroup == null)
                return BadRequest("Fixed MFS SubGroup not found.");

            var last = await _context.MfsAccounts
                .Where(m => m.SubGroupId == subGroup.Id)
                .OrderByDescending(m => m.Id)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (last != null)
            {
                var parts = last.AccountCode.Split('-');
                if (parts.Length > 0 &&
                    int.TryParse(parts.Last(), out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }

            string codePart = fixedSubGroupCode.Replace("SUB-", "");

            string nextCode =
                $"MFS-{codePart}-{nextNumber:D4}";

            return Ok(nextCode);
        }
    }
}