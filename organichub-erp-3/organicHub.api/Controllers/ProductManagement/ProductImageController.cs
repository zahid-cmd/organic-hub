using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.ProductManagement;
using OrganicHub.Api.Controllers.Base;

namespace OrganicHub.Api.Controllers.ProductManagement
{
    [Route("api/[controller]")]
    public class ProductImageController : ErpControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ProductImageController(
            ApplicationDbContext context,
            IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // =====================================================
        // GET IMAGES BY PRODUCT (ERP)
        // =====================================================
        [HttpGet("by-product/{productId}")]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var images = await _context.ProductImages
                .Where(x => x.ProductId == productId)
                .OrderBy(x => x.DisplayOrder)
                .ToListAsync();

            return Ok(images);
        }

        // =====================================================
        // UPLOAD IMAGE
        // =====================================================
        [HttpPost("upload/{productId}")]
        public async Task<IActionResult> Upload(int productId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Invalid file.");

            var productExists = await _context.Products
                .AnyAsync(p => p.Id == productId);

            if (!productExists)
                return BadRequest("Invalid product.");

            var uploadPath = Path.Combine(
                _env.WebRootPath ?? "wwwroot",
                "uploads/products"
            );

            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            bool hasPrimary = await _context.ProductImages
                .AnyAsync(x => x.ProductId == productId && x.IsPrimary);

            var image = new ProductImage
            {
                ProductId = productId,
                ImageUrl = $"uploads/products/{fileName}",
                IsPrimary = !hasPrimary,
                CreatedBy = CurrentUsername,
                CreatedDate = DateTime.UtcNow
            };

            _context.ProductImages.Add(image);
            await _context.SaveChangesAsync();

            return Ok(image);
        }

        // =====================================================
        // SET PRIMARY IMAGE
        // =====================================================
        [HttpPut("set-primary/{imageId}")]
        public async Task<IActionResult> SetPrimary(int imageId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var image = await _context.ProductImages
                    .FirstOrDefaultAsync(x => x.Id == imageId);

                if (image == null)
                    return NotFound("Image not found.");

                if (image.IsDeleted)
                    return BadRequest("Cannot set deleted image as primary.");

                var images = await _context.ProductImages
                    .Where(x => x.ProductId == image.ProductId)
                    .ToListAsync();

                foreach (var img in images)
                {
                    img.IsPrimary = img.Id == imageId;
                    img.UpdatedBy = CurrentUsername;
                    img.UpdatedDate = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Primary image updated." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, ex.Message);
            }
        }

        // =====================================================
        // SOFT DELETE
        // =====================================================
        [HttpDelete("{imageId}")]
        public async Task<IActionResult> Delete(int imageId)
        {
            var image = await _context.ProductImages
                .FirstOrDefaultAsync(x => x.Id == imageId);

            if (image == null)
                return NotFound("Image not found.");

            image.IsDeleted = true;
            image.UpdatedBy = CurrentUsername;
            image.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // If deleted image was primary → assign another as primary
            if (image.IsPrimary)
            {
                var nextImage = await _context.ProductImages
                    .Where(x => x.ProductId == image.ProductId)
                    .OrderBy(x => x.DisplayOrder)
                    .FirstOrDefaultAsync();

                if (nextImage != null)
                {
                    nextImage.IsPrimary = true;
                    nextImage.UpdatedBy = CurrentUsername;
                    nextImage.UpdatedDate = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new { message = "Image deleted successfully." });
        }
    }
}