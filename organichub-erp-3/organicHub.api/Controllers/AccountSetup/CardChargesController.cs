using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.AccountSetup;
using OrganicHub.Api.DTOs.AccountSetup;

namespace OrganicHub.Api.Controllers.AccountSetup
{
    [ApiController]
    [Route("api/card-charges")]
    public class CardChargesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CardChargesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==============================
        // GET ALL
        // ==============================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.CardCharges
                .Where(x => !x.IsDeleted)
                .Include(x => x.PosLedger)
                .Include(x => x.CardSetup)
                .OrderBy(x => x.Id)
                .Select(x => new
                {
                    x.Id,
                    PosLedger = x.PosLedger!.AccountName,   // ✅ FIXED
                    CardName = x.CardSetup!.CardName,
                    x.ChargePercent,
                    x.Status
                })
                .ToListAsync();

            return Ok(data);
        }

        // ==============================
        // GET BY ID
        // ==============================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.CardCharges
                .Include(x => x.PosLedger)
                .Include(x => x.CardSetup)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        // ==============================
        // CREATE
        // ==============================
        [HttpPost]
        public async Task<IActionResult> Create(CreateCardChargeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var entity = new CardCharge
            {
                PosLedgerId = dto.PosLedgerId,
                CardSetupId = dto.CardSetupId,
                ChargePercent = dto.ChargePercent,
                Remarks = dto.Remarks,
                Status = dto.Status,
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow
            };

            _context.CardCharges.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Card charge created successfully." });
        }

        // ==============================
        // UPDATE
        // ==============================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateCardChargeDto dto)
        {
            var existing = await _context.CardCharges
                .FirstOrDefaultAsync(x => x.Id == id);

            if (existing == null)
                return NotFound();

            existing.PosLedgerId = dto.PosLedgerId;
            existing.CardSetupId = dto.CardSetupId;
            existing.ChargePercent = dto.ChargePercent;
            existing.Remarks = dto.Remarks;
            existing.Status = dto.Status;
            existing.UpdatedBy = "System";
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Card charge updated successfully." });
        }

        // ==============================
        // DELETE (SOFT)
        // ==============================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.CardCharges
                .FirstOrDefaultAsync(x => x.Id == id);

            if (existing == null)
                return NotFound();

            existing.IsDeleted = true;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Card charge deleted successfully." });
        }
    }
}