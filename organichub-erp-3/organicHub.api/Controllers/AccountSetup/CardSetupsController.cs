using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.AccountSetup;
using OrganicHub.Api.DTOs.AccountSetup;

namespace OrganicHub.Api.Controllers.AccountSetup
{
    [ApiController]
    [Route("api/card-setups")]
    public class CardSetupsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CardSetupsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.CardSetups
                .Where(x => !x.IsDeleted)
                .OrderBy(x => x.CardCode)
                .ToListAsync();

            return Ok(data);
        }

        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.CardSetups
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(CreateCardSetupDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var nextCode = await GenerateNextCode();

            var entity = new CardSetup
            {
                CardCode = nextCode,
                CardName = dto.CardName,
                IssuingBank = dto.IssuingBank, // ✅ UPDATED
                Remarks = dto.Remarks,
                Status = dto.Status,
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow
            };

            _context.CardSetups.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Card created successfully." });
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateCardSetupDto dto)
        {
            var existing = await _context.CardSetups
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (existing == null)
                return NotFound();

            existing.CardName = dto.CardName;
            existing.IssuingBank = dto.IssuingBank; // ✅ UPDATED
            existing.Remarks = dto.Remarks;
            existing.Status = dto.Status;
            existing.UpdatedBy = "System";
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Card updated successfully." });
        }

        // =====================================================
        // DELETE (SOFT)
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.CardSetups
                .FirstOrDefaultAsync(x => x.Id == id);

            if (existing == null)
                return NotFound();

            existing.IsDeleted = true;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Card deleted successfully." });
        }

        // =====================================================
        // NEXT CODE
        // FORMAT: CARD-0001
        // =====================================================
        [HttpGet("next-code")]
        public async Task<IActionResult> GetNextCode()
        {
            var next = await GenerateNextCode();
            return Ok(next);
        }

        private async Task<string> GenerateNextCode()
        {
            var last = await _context.CardSetups
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (last != null)
            {
                var parts = last.CardCode.Split('-');
                if (int.TryParse(parts.Last(), out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }

            return $"CARD-{nextNumber:D4}";
        }
    }
}