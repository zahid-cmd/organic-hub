using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.AccountSetup;
using OrganicHub.Api.DTOs.AccountSetup;

namespace OrganicHub.Api.Controllers.AccountSetup
{
    [ApiController]
    [Route("api/bank-accounts")]
    public class BankAccountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BankAccountsController(ApplicationDbContext context)
        {
            _context = context;
        }


        // =====================================================
        // GET ALL - BANK ACCOUNT LIST (CLEAN PROJECTION)
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.BankAccounts
                .Include(b => b.Branch)              // Required for BranchName
                .Where(b => !b.IsDeleted)            // Soft delete protection
                .OrderBy(b => b.AccountCode)
                .Select(b => new
                {
                    id = b.Id,
                    accountCode = b.AccountCode,
                    accountName = b.AccountName,
                    bankAccountName = b.BankAccountName,

                    // 🔥 Branch Information (FIXED)
                    branchId = b.BranchId,
                    branchName = b.Branch != null
                        ? b.Branch.BranchName
                        : string.Empty,

                    isCollectionAccount = b.IsCollectionAccount,
                    isPaymentAccount = b.IsPaymentAccount,
                    status = b.Status
                })
                .ToListAsync();

            return Ok(data);
        }
        // ================= GET BY ID =================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.BankAccounts
                .Include(b => b.AccountSubGroup)
                .Include(b => b.Branch)
                .Where(b => b.Id == id && !b.IsDeleted)
                .Select(b => new
                {
                    id = b.Id,
                    accountCode = b.AccountCode,
                    accountName = b.AccountName,
                    bankAccountName = b.BankAccountName,

                    // ✅ Correct mapping for Angular
                    bankSetupId = b.BankId,

                    fullAccountTitle = b.FullAccountTitle,
                    shortAccountTitle = b.ShortAccountTitle,
                    fullAccountNumber = b.FullAccountNumber,
                    shortAccountNumber = b.ShortAccountNumber,
                    shortBankName = b.ShortBankName,

                    branchId = b.BranchId,
                    branchName = b.Branch.BranchName,

                    subGroupId = b.SubGroupId,
                    subCategoryName = b.AccountSubGroup.SubGroupName,
                    subCategoryCode = b.AccountSubGroup.SubGroupCode,

                    bankBranchName = b.BankBranchName,
                    bankShortBranchName = b.BankShortBranchName,

                    isCollectionAccount = b.IsCollectionAccount,
                    isPaymentAccount = b.IsPaymentAccount,
                    status = b.Status,
                    remarks = b.Remarks,

                    createdBy = b.CreatedBy,
                    createdDate = b.CreatedDate,
                    updatedBy = b.UpdatedBy,
                    updatedDate = b.UpdatedDate
                })
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        // ================= CREATE =================
        [HttpPost]
        public async Task<IActionResult> Create(CreateBankAccountDto dto)
        {
            var subGroup = await _context.AccountSubGroups
                .FirstOrDefaultAsync(s => s.SubGroupCode == "SUB-01-04-001");

            if (subGroup == null)
                return BadRequest("Fixed Bank SubGroup not found.");

            var entity = new BankAccount
            {
                AccountCode = dto.AccountCode,

                AccountName = string.IsNullOrWhiteSpace(dto.AccountName)
                    ? dto.BankAccountName
                    : dto.AccountName,

                BankAccountName = dto.BankAccountName,

                FullAccountTitle = dto.FullAccountTitle,
                ShortAccountTitle = dto.ShortAccountTitle,
                FullAccountNumber = dto.FullAccountNumber,
                ShortAccountNumber = dto.ShortAccountNumber,
                ShortBankName = dto.ShortBankName,

                // ✅ FIX HERE
                BankId = dto.BankSetupId,

                BranchId = dto.BranchId,
                SubGroupId = subGroup.Id,

                BankBranchName = dto.BankBranchName,
                BankShortBranchName = dto.BankShortBranchName,

                IsCollectionAccount = dto.IsCollectionAccount,
                IsPaymentAccount = dto.IsPaymentAccount,
                Status = dto.Status,
                Remarks = dto.Remarks,

                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.BankAccounts.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Bank Account created successfully." });
        }

        // ================= UPDATE =================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateBankAccountDto dto)
        {
            var entity = await _context.BankAccounts
                .FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);

            if (entity == null)
                return NotFound();

            entity.AccountName = string.IsNullOrWhiteSpace(dto.AccountName)
                ? dto.BankAccountName
                : dto.AccountName;

            entity.BankAccountName = dto.BankAccountName;

            entity.FullAccountTitle = dto.FullAccountTitle;
            entity.ShortAccountTitle = dto.ShortAccountTitle;
            entity.FullAccountNumber = dto.FullAccountNumber;
            entity.ShortAccountNumber = dto.ShortAccountNumber;
            entity.ShortBankName = dto.ShortBankName;

            // ✅ FIX HERE
            entity.BankId = dto.BankSetupId;

            entity.BranchId = dto.BranchId;
            entity.BankBranchName = dto.BankBranchName;
            entity.BankShortBranchName = dto.BankShortBranchName;

            entity.IsCollectionAccount = dto.IsCollectionAccount;
            entity.IsPaymentAccount = dto.IsPaymentAccount;
            entity.Status = dto.Status;
            entity.Remarks = dto.Remarks;

            entity.UpdatedBy = "System";
            entity.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Bank Account updated successfully." });
        }
        // ================= NEXT CODE =================
        [HttpGet("next-code")]
        public async Task<IActionResult> GetNextCode()
        {
            // Get last account code
            var lastCode = await _context.BankAccounts
                .Where(b => !b.IsDeleted)
                .OrderByDescending(b => b.Id)
                .Select(b => b.AccountCode)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (!string.IsNullOrEmpty(lastCode))
            {
                var parts = lastCode.Split('-');
                var lastNumberPart = parts.Last();

                if (int.TryParse(lastNumberPart, out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }

            // 🔥 Adjust prefix format if needed
            var nextCode = $"BA-01-05-001-{nextNumber:D4}";

            return Ok(nextCode);
        }

        // ================= DELETE =================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.BankAccounts
                .FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);

            if (entity == null)
                return NotFound();

            entity.IsDeleted = true;
            entity.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Deleted successfully." });
        }
    }
}