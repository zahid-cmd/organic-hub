using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.ClientManagement;
using OrganicHub.Api.Models.AccountSetup;
using OrganicHub.Api.DTOs.ClientManagement;

namespace OrganicHub.Api.Controllers.ClientManagement
{
    [ApiController]
    [Route("api/customers")]
    public class CustomerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // 🔥 UPDATED PREFIX
        private const string FIXED_SUBGROUP_CODE = "SUB-01-01-001";

        public CustomerController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // PRIVATE: GET FIXED SUBGROUP
        // =====================================================
        private async Task<AccountSubGroup?> GetFixedSubGroup()
        {
            return await _context.AccountSubGroups
                .FirstOrDefaultAsync(s =>
                    s.SubGroupCode == FIXED_SUBGROUP_CODE &&
                    !s.IsDeleted);
        }

        // =====================================================
        // PRIVATE: GENERATE NEXT CODE
        // =====================================================
        private async Task<string> GenerateNextCustomerCode(AccountSubGroup subGroup)
        {
            var parts = subGroup.SubGroupCode.Split('-');

            string classNo = parts[1];
            string groupNo = parts[2];
            string subGroupNo = parts[3];

            var lastCode = await _context.Customers
                .Where(c => c.AccountSubGroupId == subGroup.Id && !c.IsDeleted)
                .OrderByDescending(c => c.Id)
                .Select(c => c.CustomerCode)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (!string.IsNullOrEmpty(lastCode))
            {
                var lastParts = lastCode.Split('-');
                if (int.TryParse(lastParts.Last(), out int lastNumber))
                    nextNumber = lastNumber + 1;
            }

            return $"CUS-{classNo}-{groupNo}-{subGroupNo}-{nextNumber:D4}";
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var customers = await _context.Customers
                .Include(c => c.AccountSubGroup)
                .Where(c => !c.IsDeleted)
                .OrderBy(c => c.CustomerCode)
                .Select(c => new
                {
                    c.Id,
                    c.CustomerCode,
                    c.CustomerName,
                    c.PrimaryPhone,
                    c.SecondaryPhone,
                    c.Status,
                    AccountSubGroupName = c.AccountSubGroup != null
                        ? c.AccountSubGroup.SubGroupName
                        : null,
                    SubGroupCode = c.AccountSubGroup != null
                        ? c.AccountSubGroup.SubGroupCode
                        : null
                })
                .ToListAsync();

            return Ok(customers);
        }

        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var customer = await _context.Customers
                .Include(c => c.AccountSubGroup)
                .Where(c => c.Id == id && !c.IsDeleted)
                .Select(c => new
                {
                    c.Id,
                    c.CustomerCode,
                    c.CustomerName,
                    c.PrimaryPhone,
                    c.SecondaryPhone,
                    c.Email,
                    c.Address,
                    c.Remarks,
                    c.Status,
                    c.CreatedBy,
                    c.CreatedDate,
                    c.UpdatedBy,
                    c.UpdatedDate,
                    AccountSubGroupName = c.AccountSubGroup != null
                        ? c.AccountSubGroup.SubGroupName
                        : null,
                    SubGroupCode = c.AccountSubGroup != null
                        ? c.AccountSubGroup.SubGroupCode
                        : null
                })
                .FirstOrDefaultAsync();

            if (customer == null)
                return NotFound(new { message = "Customer not found." });

            return Ok(customer);
        }

        // =====================================================
        // GET FIXED SUBGROUP
        // =====================================================
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

        // =====================================================
        // GET NEXT CODE
        // =====================================================
        [HttpGet("next-code")]
        public async Task<IActionResult> GetNextCode()
        {
            var subGroup = await GetFixedSubGroup();

            if (subGroup == null)
                return NotFound("Fixed SubGroup not found.");

            var code = await GenerateNextCustomerCode(subGroup);

            return Ok(code);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CustomerCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CustomerName))
                return BadRequest(new { message = "Customer Name is required." });

            var subGroup = await GetFixedSubGroup();

            if (subGroup == null)
                return BadRequest(new { message = "Fixed SubGroup not found." });

            var newCode = await GenerateNextCustomerCode(subGroup);

            var model = new Customer
            {
                CustomerCode = newCode,
                CustomerName = dto.CustomerName.Trim(),
                AccountSubGroupId = subGroup.Id,
                PrimaryPhone = dto.PrimaryPhone,
                SecondaryPhone = dto.SecondaryPhone,
                Email = dto.Email,
                Address = dto.Address,
                Remarks = dto.Remarks,
                Status = dto.Status ?? "Active",
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow
            };

            _context.Customers.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Customer created successfully." });
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CustomerCreateDto dto)
        {
            var existing = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (existing == null)
                return NotFound(new { message = "Customer not found." });

            if (string.IsNullOrWhiteSpace(dto.CustomerName))
                return BadRequest(new { message = "Customer Name is required." });

            existing.CustomerName = dto.CustomerName.Trim();
            existing.PrimaryPhone = dto.PrimaryPhone?.Trim();
            existing.SecondaryPhone = dto.SecondaryPhone?.Trim();
            existing.Email = dto.Email?.Trim();
            existing.Address = dto.Address?.Trim();
            existing.Remarks = dto.Remarks?.Trim();
            existing.Status = dto.Status ?? existing.Status;
            existing.UpdatedBy = "System";
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Customer updated successfully." });
        }

        // =====================================================
        // DELETE (SOFT)
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (existing == null)
                return NotFound(new { message = "Customer not found." });

            existing.IsDeleted = true;
            existing.UpdatedBy = "System";
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Customer deleted successfully." });
        }
    }
}