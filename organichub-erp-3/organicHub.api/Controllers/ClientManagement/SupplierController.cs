using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.ClientManagement;
using OrganicHub.Api.Models.AccountSetup;
using OrganicHub.Api.DTOs.ClientManagement;

namespace OrganicHub.Api.Controllers.ClientManagement
{
    [ApiController]
    [Route("api/suppliers")]
    public class SupplierController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SupplierController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 🔥 UPDATED PREFIX HERE
        private const string FIXED_SUBGROUP_CODE = "SUB-03-01-001";

        // ========================= GET ALL =========================
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var suppliers = await _context.Suppliers
                .Include(s => s.AccountSubGroup)
                .Where(s => !s.IsDeleted)
                .OrderBy(s => s.SupplierCode)
                .Select(s => new
                {
                    s.Id,
                    s.SupplierCode,
                    s.SupplierName,
                    s.PrimaryPhone,
                    s.Phone,
                    s.Email,
                    s.Address,
                    s.Status,
                    s.Remarks,
                    s.ContactPerson,
                    AccountSubGroupName = s.AccountSubGroup != null
                        ? s.AccountSubGroup.SubGroupName
                        : "",
                    SubGroupCode = s.AccountSubGroup != null
                        ? s.AccountSubGroup.SubGroupCode
                        : ""
                })
                .ToListAsync();

            return Ok(suppliers);
        }

        // ========================= GET BY ID =========================
        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var supplier = await _context.Suppliers
                .Include(s => s.AccountSubGroup)
                .Where(s => s.Id == id && !s.IsDeleted)
                .Select(s => new
                {
                    s.Id,
                    s.SupplierCode,
                    s.SupplierName,
                    s.PrimaryPhone,
                    s.Phone,
                    s.Email,
                    s.Address,
                    s.Status,
                    s.Remarks,
                    s.ContactPerson,
                    s.CreatedBy,
                    s.CreatedDate,
                    s.UpdatedBy,
                    s.UpdatedDate,
                    AccountSubGroupName = s.AccountSubGroup != null
                        ? s.AccountSubGroup.SubGroupName
                        : "",
                    SubGroupCode = s.AccountSubGroup != null
                        ? s.AccountSubGroup.SubGroupCode
                        : ""
                })
                .FirstOrDefaultAsync();

            if (supplier == null)
                return NotFound(new { message = "Supplier not found." });

            return Ok(supplier);
        }

        // ========================= PRIVATE METHODS =========================
        private async Task<AccountSubGroup?> GetFixedSubGroup()
        {
            return await _context.AccountSubGroups
                .FirstOrDefaultAsync(sg =>
                    sg.SubGroupCode == FIXED_SUBGROUP_CODE &&
                    !sg.IsDeleted);
        }

        private async Task<int> GetNextLedgerNumber(int subGroupId)
        {
            var lastCode = await _context.Suppliers
                .Where(s => s.AccountSubGroupId == subGroupId && !s.IsDeleted)
                .OrderByDescending(s => s.Id)
                .Select(s => s.SupplierCode)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (!string.IsNullOrEmpty(lastCode))
            {
                var parts = lastCode.Split('-');
                if (int.TryParse(parts.Last(), out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }

            return nextNumber;
        }

        // ================== GET FIXED SUBGROUP INFO =========================
        [HttpGet("fixed-subgroup")]
        public async Task<IActionResult> GetFixedSubGroupInfo()
        {
            var subGroup = await GetFixedSubGroup();

            if (subGroup == null)
                return NotFound(new { message = "Fixed SubGroup not found." });

            return Ok(new
            {
                accountSubGroupName = subGroup.SubGroupName,
                subGroupCode = subGroup.SubGroupCode
            });
        }

        // ========================= GET NEXT CODE =========================
        [HttpGet("next-code")]
        public async Task<ActionResult<string>> GetNextCode()
        {
            var subGroup = await GetFixedSubGroup();

            if (subGroup == null)
                return NotFound(new { message = "Fixed SubGroup not found." });

            var parts = subGroup.SubGroupCode.Split('-');

            string classNo = parts[1];
            string groupNo = parts[2];
            string subGroupNo = parts[3];

            int nextLedgerNo = await GetNextLedgerNumber(subGroup.Id);

            string newCode =
                $"SUP-{classNo}-{groupNo}-{subGroupNo}-{nextLedgerNo:D4}";

            return Ok(newCode);
        }

        // ========================= CREATE =========================
        [HttpPost]
        public async Task<ActionResult> Create(SupplierCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.SupplierName))
                return BadRequest(new { message = "Supplier Name is required." });

            var subGroup = await GetFixedSubGroup();

            if (subGroup == null)
                return BadRequest(new { message = "Fixed SubGroup not found." });

            int nextLedgerNo = await GetNextLedgerNumber(subGroup.Id);

            var parts = subGroup.SubGroupCode.Split('-');

            string classNo = parts[1];
            string groupNo = parts[2];
            string subGroupNo = parts[3];

            string newCode =
                $"SUP-{classNo}-{groupNo}-{subGroupNo}-{nextLedgerNo:D4}";

            var model = new Supplier
            {
                SupplierCode = newCode,
                SupplierName = dto.SupplierName.Trim(),
                AccountSubGroupId = subGroup.Id,
                ContactPerson = dto.ContactPerson,
                PrimaryPhone = dto.PrimaryPhone,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,
                Status = dto.Status ?? "Active",
                Remarks = dto.Remarks,
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow
            };

            _context.Suppliers.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Supplier created successfully." });
        }

        // ========================= UPDATE =========================
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, SupplierCreateDto dto)
        {
            var existing = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);

            if (existing == null)
                return NotFound(new { message = "Supplier not found." });

            if (string.IsNullOrWhiteSpace(dto.SupplierName))
                return BadRequest(new { message = "Supplier Name is required." });

            existing.SupplierName = dto.SupplierName.Trim();
            existing.ContactPerson = dto.ContactPerson;
            existing.PrimaryPhone = dto.PrimaryPhone;
            existing.Phone = dto.Phone;
            existing.Email = dto.Email;
            existing.Address = dto.Address;
            existing.Status = dto.Status ?? existing.Status;
            existing.Remarks = dto.Remarks;
            existing.UpdatedBy = "System";
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Supplier updated successfully." });
        }

        // ========================= DELETE =========================
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var existing = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);

            if (existing == null)
                return NotFound(new { message = "Supplier not found." });

            existing.IsDeleted = true;
            existing.UpdatedBy = "System";
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Supplier deleted successfully." });
        }
    }
}