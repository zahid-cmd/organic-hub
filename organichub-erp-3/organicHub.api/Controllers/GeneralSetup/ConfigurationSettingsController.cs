using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.GeneralSetup;

namespace OrganicHub.Api.Controllers.GeneralSetup
{
    [Route("api/general-setup/configuration-settings")]
    [ApiController]
    public class ConfigurationSettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ConfigurationSettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================
        // GET ALL
        // =========================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.ConfigurationSettings
                .OrderBy(x => x.Module)
                .ThenBy(x => x.ConfigurationCode)
                .ToListAsync();

            return Ok(data);
        }

        // =========================================
        // GET BY MODULE
        // =========================================
        [HttpGet("module/{module}")]
        public async Task<IActionResult> GetByModule(string module)
        {
            var data = await _context.ConfigurationSettings
                .Where(x => x.Module == module)
                .OrderBy(x => x.ConfigurationCode)
                .ToListAsync();

            return Ok(data);
        }

        // =========================================
        // CREATE
        // =========================================
        [HttpPost]
        public async Task<IActionResult> Create(ConfigurationSetting model)
        {
            // Generate next code
            var prefix = GetPrefix(model.Module);

            var lastCode = await _context.ConfigurationSettings
                .Where(x => x.Module == model.Module)
                .OrderByDescending(x => x.Id)
                .Select(x => x.ConfigurationCode)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (!string.IsNullOrEmpty(lastCode))
            {
                var parts = lastCode.Split('-');
                if (parts.Length == 2 && int.TryParse(parts[1], out int number))
                {
                    nextNumber = number + 1;
                }
            }

            model.ConfigurationCode = $"{prefix}-{nextNumber.ToString("D3")}";
            model.CreatedDate = DateTime.UtcNow;
            model.IsDeleted = false;

            _context.ConfigurationSettings.Add(model);
            await _context.SaveChangesAsync();

            return Ok(model);
        }

        // =========================================
        // UPDATE
        // =========================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, ConfigurationSetting model)
        {
            var existing = await _context.ConfigurationSettings.FindAsync(id);

            if (existing == null)
                return NotFound();

            existing.ConfigurationName = model.ConfigurationName;
            existing.IsEnabled = model.IsEnabled;
            existing.Remarks = model.Remarks;
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(existing);
        }

        // =========================================
        // SOFT DELETE
        // =========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var existing = await _context.ConfigurationSettings.FindAsync(id);

            if (existing == null)
                return NotFound();

            existing.IsDeleted = true;
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok();
        }

        // =========================================
        // PRIVATE HELPER
        // =========================================
        private string GetPrefix(string module)
        {
            return module switch
            {
                "Purchase" => "PG",
                "Sales" => "SG",
                "Inventory" => "IN",
                "Invoice" => "IV",
                _ => "CF"
            };
        }
    }
}