using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.DTOs.GeneralSetup;
using OrganicHub.Api.Models.GeneralSetup;

namespace OrganicHub.Api.Controllers.GeneralSetup
{
    [ApiController]
    [Route("api/Warehouse")]
    public class WarehouseController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WarehouseController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var data = await _context.Warehouses
                .Include(w => w.Branch)
                .ThenInclude(b => b.Company)
                .Where(w => !w.IsDeleted)
                .OrderByDescending(w => w.Id)
                .Select(w => new
                {
                    w.Id,
                    w.WarehouseCode,
                    w.WarehouseName,
                    CompanyName = w.Branch.Company.CompanyName,
                    BranchName = w.Branch.BranchName,
                    w.IsDefault,
                    w.Status
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
            var entity = await _context.Warehouses
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                return NotFound();

            return Ok(entity);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(WarehouseCreateDto dto)
        {
            if (dto.CompanyId <= 0 || dto.BranchId <= 0)
                return BadRequest("Company and Branch required.");

            if (string.IsNullOrWhiteSpace(dto.WarehouseName))
                return BadRequest("Warehouse name required.");

            var companyExists = await _context.Companies
                .AnyAsync(x => x.Id == dto.CompanyId);

            if (!companyExists)
                return BadRequest("Invalid company.");

            var branchExists = await _context.Branches
                .AnyAsync(x => x.Id == dto.BranchId);

            if (!branchExists)
                return BadRequest("Invalid branch.");

            using var trx = await _context.Database.BeginTransactionAsync();

            try
            {
                if (dto.IsDefault)
                    await RemoveExistingDefault(dto.BranchId);

                var entity = new Warehouse
                {
                    CompanyId = dto.CompanyId,
                    BranchId = dto.BranchId,
                    WarehouseCode = await GenerateNextWarehouseCode(),
                    WarehouseName = dto.WarehouseName.Trim(),
                    IsDefault = dto.IsDefault,
                    Status = string.IsNullOrWhiteSpace(dto.Status) ? "Active" : dto.Status,
                    CreatedDate = DateTime.UtcNow,
                    CreatedBy = "System"
                };

                _context.Warehouses.Add(entity);

                await _context.SaveChangesAsync();
                await trx.CommitAsync();

                return Ok(new { message = "Warehouse created successfully." });
            }
            catch
            {
                await trx.RollbackAsync();
                return StatusCode(500, "Failed to create warehouse.");
            }
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, WarehouseCreateDto dto)
        {
            var entity = await _context.Warehouses
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                return NotFound();

            using var trx = await _context.Database.BeginTransactionAsync();

            try
            {
                if (dto.IsDefault)
                    await RemoveExistingDefault(entity.BranchId);

                entity.CompanyId = dto.CompanyId;
                entity.BranchId = dto.BranchId;
                entity.WarehouseName = dto.WarehouseName.Trim();
                entity.IsDefault = dto.IsDefault;
                entity.Status = dto.Status ?? "Active";
                entity.UpdatedDate = DateTime.UtcNow;
                entity.UpdatedBy = "System";

                await _context.SaveChangesAsync();
                await trx.CommitAsync();

                return Ok(new { message = "Warehouse updated successfully." });
            }
            catch
            {
                await trx.RollbackAsync();
                return StatusCode(500, "Failed to update warehouse.");
            }
        }

        // =====================================================
        // DELETE (SOFT)
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var entity = await _context.Warehouses
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                return NotFound();

            entity.IsDeleted = true;
            entity.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Warehouse deleted successfully." });
        }

        // =====================================================
        // REMOVE EXISTING DEFAULT
        // =====================================================
        private async Task RemoveExistingDefault(long branchId)
        {
            var defaults = await _context.Warehouses
                .Where(x => x.BranchId == branchId &&
                            x.IsDefault &&
                            !x.IsDeleted)
                .ToListAsync();

            foreach (var item in defaults)
                item.IsDefault = false;
        }

        // =====================================================
        // NEXT CODE
        // =====================================================
        [HttpGet("next-code")]
        public async Task<IActionResult> GetNextCode()
        {
            var code = await GenerateNextWarehouseCode();
            return Ok(code);
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