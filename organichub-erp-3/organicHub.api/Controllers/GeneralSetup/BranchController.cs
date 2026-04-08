using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.DTOs.GeneralSetup;
using OrganicHub.Api.Models.GeneralSetup;

namespace OrganicHub.Api.Controllers.GeneralSetup
{
    [ApiController]
    [Route("api/Branch")]
    public class BranchController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BranchController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BranchListDto>>> GetAll()
        {
            var data = await _context.Branches
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.Id)
                .Select(x => new BranchListDto
                {
                    Id = x.Id,
                    CompanyId = x.CompanyId,
                    BranchCode = x.BranchCode,
                    BranchName = x.BranchName,
                    Email = x.Email,
                    PrimaryPhone = x.PrimaryPhone,
                    Status = x.Status
                })
                .ToListAsync();

            return Ok(data);
        }

        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(long id)
        {
            var entity = await _context.Branches
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                return NotFound();

            return Ok(entity);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(BranchCreateDto dto)
        {
            if (dto.CompanyId <= 0)
                return BadRequest("Company required.");

            if (string.IsNullOrWhiteSpace(dto.BranchName))
                return BadRequest("Branch name required.");

            if (string.IsNullOrWhiteSpace(dto.PrimaryPhone))
                return BadRequest("Primary phone required.");

            if (string.IsNullOrWhiteSpace(dto.Location))
                return BadRequest("Location required.");

            var companyExists = await _context.Companies
                .AnyAsync(x => x.Id == dto.CompanyId);

            if (!companyExists)
                return BadRequest("Invalid company.");

            using var trx = await _context.Database.BeginTransactionAsync();

            try
            {
                var entity = new Branch
                {
                    CompanyId = dto.CompanyId,
                    BranchCode = await GenerateNextBranchCode(),
                    BranchName = dto.BranchName.Trim(),
                    Status = string.IsNullOrWhiteSpace(dto.Status) ? "Active" : dto.Status,

                    PrimaryPhone = dto.PrimaryPhone,
                    SecondaryPhone = dto.SecondaryPhone,
                    Email = dto.Email,
                    Location = dto.Location,
                    Address = dto.Address,

                    Bin = dto.Bin,
                    VatPaymentCode = dto.VatPaymentCode,
                    EconomicActivity = dto.EconomicActivity,

                    CreatedBy = "System",
                    CreatedDate = DateTime.UtcNow
                };

                _context.Branches.Add(entity);
                await _context.SaveChangesAsync();

                // ⭐ AUTO DEFAULT WAREHOUSE
                var warehouse = new Warehouse
                {
                    CompanyId = entity.CompanyId,
                    BranchId = entity.Id,
                    WarehouseCode = await GenerateNextWarehouseCode(),
                    WarehouseName = entity.BranchName + " Warehouse",
                    IsDefault = true,
                    Status = "Active",
                    CreatedBy = "System",
                    CreatedDate = DateTime.UtcNow
                };

                _context.Warehouses.Add(warehouse);

                await _context.SaveChangesAsync();
                await trx.CommitAsync();

                return Ok(new
                {
                    message = "Branch and default warehouse created successfully."
                });
            }
            catch
            {
                await trx.RollbackAsync();
                return StatusCode(500, "Failed to create branch.");
            }
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, BranchCreateDto dto)
        {
            var entity = await _context.Branches
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                return NotFound();

            entity.CompanyId = dto.CompanyId;
            entity.BranchName = dto.BranchName.Trim();
            entity.Status = dto.Status ?? "Active";

            entity.PrimaryPhone = dto.PrimaryPhone;
            entity.SecondaryPhone = dto.SecondaryPhone;
            entity.Email = dto.Email;
            entity.Location = dto.Location;
            entity.Address = dto.Address;

            entity.Bin = dto.Bin;
            entity.VatPaymentCode = dto.VatPaymentCode;
            entity.EconomicActivity = dto.EconomicActivity;

            entity.UpdatedBy = "System";
            entity.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Branch updated successfully." });
        }

        // =====================================================
        // DELETE (PROTECTED)
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var entity = await _context.Branches
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                return NotFound();

            var hasWarehouse = await _context.Warehouses
                .AnyAsync(x => x.BranchId == id && !x.IsDeleted);

            if (hasWarehouse)
                return BadRequest(new
                {
                    message = "Cannot delete branch. Warehouses exist."
                });

            entity.IsDeleted = true;
            entity.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Branch deleted successfully." });
        }

        // =====================================================
        // NEXT CODE
        // =====================================================
        [HttpGet("next-code")]
        public async Task<IActionResult> GetNextCode()
        {
            var code = await GenerateNextBranchCode();
            return Ok(code);
        }

        private async Task<string> GenerateNextBranchCode()
        {
            var last = await _context.Branches
                .IgnoreQueryFilters()
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            int next = 1;

            if (last != null && !string.IsNullOrWhiteSpace(last.BranchCode))
            {
                var parts = last.BranchCode.Split('-');
                if (parts.Length == 2 &&
                    int.TryParse(parts[1], out int num))
                    next = num + 1;
            }

            return $"BR-{next:D3}";
        }

        private async Task<string> GenerateNextWarehouseCode()
        {
            var last = await _context.Warehouses
                .IgnoreQueryFilters()
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            int next = 1;

            if (last != null && !string.IsNullOrWhiteSpace(last.WarehouseCode))
            {
                var parts = last.WarehouseCode.Split('-');
                if (parts.Length == 2 &&
                    int.TryParse(parts[1], out int num))
                    next = num + 1;
            }

            return $"WH-{next:D3}";
        }
    }
}