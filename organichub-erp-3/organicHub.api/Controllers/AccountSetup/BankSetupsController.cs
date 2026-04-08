using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.AccountSetup;
using OrganicHub.Api.DTOs.AccountSetup;

namespace OrganicHub.Api.Controllers.AccountSetup
{
    [ApiController]
    [Route("api/bank-setups")]
    public class BankSetupsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BankSetupsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.BankSetups
                .OrderBy(b => b.BankCode)
                .ToListAsync();

            return Ok(data);
        }

        // GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var item = await _context.BankSetups.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        // GENERATE CODE BNK-001
        [HttpGet("next-code")]
        public async Task<IActionResult> GetNextCode()
        {
            var last = await _context.BankSetups
                .OrderByDescending(b => b.Id)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (last != null)
            {
                var numberPart = last.BankCode.Replace("BNK-", "");
                int.TryParse(numberPart, out nextNumber);
                nextNumber++;
            }

            var nextCode = $"BNK-{nextNumber:000}";
            return Ok(nextCode);
        }

        // CREATE
        [HttpPost]
        public async Task<IActionResult> Create(CreateBankSetupDto dto)
        {
            var last = await _context.BankSetups
                .OrderByDescending(b => b.Id)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (last != null)
            {
                var numberPart = last.BankCode?.Replace("BNK-", "");
                if (int.TryParse(numberPart, out int parsed))
                    nextNumber = parsed + 1;
            }

            var entity = new BankSetup
            {
                BankCode = $"BNK-{nextNumber:000}",
                BankName = dto.BankName,
                ShortName = dto.ShortName,
                RoutingNumber = dto.RoutingNumber,
                SwiftCode = dto.SwiftCode,
                Status = dto.Status,
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow
            };

            _context.BankSetups.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Saved successfully." });
        }
        // UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, BankSetup model)
        {
            var existing = await _context.BankSetups.FindAsync(id);
            if (existing == null) return NotFound();

            existing.BankName = model.BankName;
            existing.ShortName = model.ShortName;
            existing.RoutingNumber = model.RoutingNumber;
            existing.SwiftCode = model.SwiftCode;
            existing.Status = model.Status;
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Updated successfully." });
        }

        // DELETE (Soft)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.BankSetups.FindAsync(id);
            if (item == null) return NotFound();

            item.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}