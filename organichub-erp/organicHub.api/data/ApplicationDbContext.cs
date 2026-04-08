using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Models;

namespace OrganicHub.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // =========================
        // TABLES
        // =========================
        public DbSet<Unit> Units { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<SubCategory> SubCategories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductType> ProductTypes { get; set; }

        // =========================
        // MODEL CONFIGURATION
        // =========================
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ====================================================
            // CATEGORY CONFIG
            // ====================================================

            modelBuilder.Entity<Category>()
                .HasIndex(c => c.CategoryCode)
                .IsUnique();

            modelBuilder.Entity<Category>()
                .Property(c => c.CategoryCode)
                .HasMaxLength(50);

            modelBuilder.Entity<Category>()
                .Property(c => c.CategoryName)
                .HasMaxLength(150);

            // ====================================================
            // SUB CATEGORY CONFIG
            // ====================================================

            modelBuilder.Entity<SubCategory>()
                .HasIndex(s => s.SubCategoryCode)
                .IsUnique();

            modelBuilder.Entity<SubCategory>()
                .Property(s => s.SubCategoryCode)
                .HasMaxLength(50);

            modelBuilder.Entity<SubCategory>()
                .Property(s => s.SubCategoryName)
                .HasMaxLength(150);

            modelBuilder.Entity<SubCategory>()
                .HasOne(s => s.Category)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(s => s.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // ====================================================
            // PRODUCT CONFIG
            // ====================================================

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.ProductCode)
                .IsUnique();

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.SKU)
                .IsUnique();

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Barcode)
                .IsUnique();

            modelBuilder.Entity<Product>()
                .Property(p => p.ProductCode)
                .HasMaxLength(50);

            modelBuilder.Entity<Product>()
                .Property(p => p.ProductName)
                .HasMaxLength(200);

            // FK → ProductType
            modelBuilder.Entity<Product>()
                .HasOne(p => p.ProductType)
                .WithMany(pt => pt.Products)
                .HasForeignKey(p => p.ProductTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // FK → Category
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany()
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // FK → SubCategory
            modelBuilder.Entity<Product>()
                .HasOne(p => p.SubCategory)
                .WithMany(sc => sc.Products)
                .HasForeignKey(p => p.SubCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // FK → Unit
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Unit)
                .WithMany()
                .HasForeignKey(p => p.UnitId)
                .OnDelete(DeleteBehavior.Restrict);

            // Soft Delete Filter
            modelBuilder.Entity<Product>()
                .HasQueryFilter(p => !p.IsDeleted);

            // ====================================================
            // PRODUCT TYPE CONFIG
            // ====================================================

            modelBuilder.Entity<ProductType>()
                .HasIndex(p => p.TypeCode)
                .IsUnique();

            modelBuilder.Entity<ProductType>()
                .Property(p => p.TypeCode)
                .HasMaxLength(20);

            modelBuilder.Entity<ProductType>()
                .Property(p => p.TypeName)
                .HasMaxLength(150);
        }
    }
}
