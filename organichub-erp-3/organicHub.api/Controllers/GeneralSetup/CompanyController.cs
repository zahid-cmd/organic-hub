using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.DTOs.GeneralSetup;
using OrganicHub.Api.Models.GeneralSetup;

namespace OrganicHub.Api.Controllers.GeneralSetup
{
    [ApiController]
    [Route("api/Company")]
    public class CompanyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CompanyController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CompanyListDto>>> GetAll()
        {
            var data = await _context.Companies
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.Id)
                .Select(x => new CompanyListDto
                {
                    Id = x.Id,
                    CompanyCode = x.CompanyCode,
                    CompanyName = x.CompanyName,
                    Email = x.Email,
                    Website = x.Website,
                    Bin = x.Bin,
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
            var entity = await _context.Companies
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                return NotFound();

            return Ok(entity);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(CompanyCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyName))
                return BadRequest("Company name required.");

            var entity = new Company
            {
                CompanyCode = await GenerateNextCompanyCode(),
                CompanyName = dto.CompanyName.Trim(),
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Active" : dto.Status,
                Remarks = dto.Remarks,
                PrimaryPhone = dto.PrimaryPhone,
                SecondaryPhone = dto.SecondaryPhone,
                Email = dto.Email,
                Website = dto.Website,
                Tin = dto.Tin,
                Bin = dto.Bin,
                VatPaymentCode = dto.VatPaymentCode,
                OwnershipType = dto.OwnershipType,
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow
            };

            _context.Companies.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Company created successfully." });
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, CompanyCreateDto dto)
        {
            var entity = await _context.Companies
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                return NotFound();

            entity.CompanyName = dto.CompanyName.Trim();
            entity.Status = dto.Status ?? "Active";
            entity.Remarks = dto.Remarks;
            entity.PrimaryPhone = dto.PrimaryPhone;
            entity.SecondaryPhone = dto.SecondaryPhone;
            entity.Email = dto.Email;
            entity.Website = dto.Website;
            entity.Tin = dto.Tin;
            entity.Bin = dto.Bin;
            entity.VatPaymentCode = dto.VatPaymentCode;
            entity.OwnershipType = dto.OwnershipType;
            entity.UpdatedBy = "System";
            entity.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Company updated successfully." });
        }

        // =====================================================
        // DELETE (SOFT + PROTECTED)
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var entity = await _context.Companies
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                return NotFound();

            var hasBranch = await _context.Branches
                .AnyAsync(x => x.CompanyId == id && !x.IsDeleted);

            if (hasBranch)
                return BadRequest(new
                {
                    message = "Cannot delete company. Branch exists."
                });

            entity.IsDeleted = true;
            entity.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Company deleted successfully." });
        }

        // =====================================================
        // NEXT CODE
        // =====================================================
        [HttpGet("next-code")]
        public async Task<IActionResult> GetNextCode()
        {
            var code = await GenerateNextCompanyCode();
            return Ok(code);
        }

        private async Task<string> GenerateNextCompanyCode()
        {
            var last = await _context.Companies
                .IgnoreQueryFilters()
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            int next = 1001;

            if (last != null && !string.IsNullOrWhiteSpace(last.CompanyCode))
            {
                var parts = last.CompanyCode.Split('-');
                if (parts.Length == 2 &&
                    int.TryParse(parts[1], out int num))
                    next = num + 1;
            }

            return $"COM-{next}";
        }

        // =====================================================
        // UPLOAD LOGO
        // =====================================================
        [HttpPost("{id}/upload-logo")]
        public async Task<IActionResult> UploadLogo(long id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File required.");

            var entity = await _context.Companies
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                return NotFound();

            var folder = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads",
                "company-logos");

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var ext = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{ext}";
            var path = Path.Combine(folder, fileName);

            using var stream = new FileStream(path, FileMode.Create);
            await file.CopyToAsync(stream);

            entity.LogoFileName = fileName;
            entity.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Logo uploaded successfully." });
        }
    }
}