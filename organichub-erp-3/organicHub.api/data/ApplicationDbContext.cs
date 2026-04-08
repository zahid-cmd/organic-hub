using OrganicHub.Api.Models.Inventory;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Models.ProductManagement;
using OrganicHub.Api.Models.ClientManagement;
using OrganicHub.Api.Models.Sales;
using OrganicHub.Api.Models.Auth;
using OrganicHub.Api.Models.Purchase;
using OrganicHub.Api.Models.GeneralSetup;
using OrganicHub.Api.Models.AccountSetup;



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
        public DbSet<InventoryBatch> InventoryBatches { get; set; }
        public DbSet<InventoryBatchTransaction> InventoryBatchTransactions { get; set; }
        public DbSet<InventoryReservation> InventoryReservations { get; set; }

        public DbSet<Unit> Units { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<SubCategory> SubCategories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductType> ProductTypes { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<OnlineOrder> OnlineOrders { get; set; }
        public DbSet<OnlineOrderItem> OnlineOrderItems { get; set; }
        public DbSet<ProductSalePrice> ProductSalePrices { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
        public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
        public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; }



        public DbSet<Company> Companies { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<ConfigurationSetting> ConfigurationSettings { get; set; }
        public DbSet<AccountClass> AccountClasses { get; set; }
        public DbSet<AccountGroup> AccountGroups { get; set; }
        public DbSet<AccountSubGroup> AccountSubGroups { get; set; }
        public DbSet<GeneralLedger> GeneralLedgers { get; set; }
        public DbSet<CashAccount> CashAccounts { get; set; }
        public DbSet<BankAccount> BankAccounts { get; set; }
        public DbSet<MfsAccount> MfsAccounts { get; set; }
        public DbSet<PosAccount> PosAccounts { get; set; }

        public DbSet<BankSetup> BankSetups { get; set; }
        public DbSet<CardSetup> CardSetups { get; set; }
        public DbSet<CardCharge> CardCharges { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ====================================================
            // CATEGORY
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
            // SUB CATEGORY
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
            // PRODUCT
            // ====================================================
            modelBuilder.Entity<Product>(entity =>
            {
                // ---------- UNIQUE INDEXES ----------
                
                // ProductCode MUST be unique
                entity.HasIndex(p => p.ProductCode)
                    .IsUnique();

                // SKU is NOT unique (removed uniqueness)

                // Barcode should be unique but allow NULL
                entity.HasIndex(p => p.Barcode)
                    .HasFilter("\"Barcode\" IS NOT NULL")
                    .IsUnique();

                // ---------- FIELD LENGTHS ----------
                
                entity.Property(p => p.ProductCode)
                    .HasMaxLength(50);

                entity.Property(p => p.ProductName)
                    .HasMaxLength(200);

                entity.Property(p => p.SKU)
                    .HasMaxLength(100);

                entity.Property(p => p.Barcode)
                    .HasMaxLength(100);

                entity.Property(p => p.Status)
                    .HasMaxLength(20);

                entity.Property(p => p.Remarks)
                    .HasMaxLength(255);

                // ---------- RELATIONSHIPS ----------

                entity.HasOne(p => p.ProductType)
                    .WithMany(pt => pt.Products)
                    .HasForeignKey(p => p.ProductTypeId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Category)
                    .WithMany()
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.SubCategory)
                    .WithMany(sc => sc.Products)
                    .HasForeignKey(p => p.SubCategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Unit)
                    .WithMany(u => u.Products)
                    .HasForeignKey(p => p.UnitId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(p => p.ProductImages)
                    .WithOne(pi => pi.Product)
                    .HasForeignKey(pi => pi.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);

                // ---------- SOFT DELETE ----------
                entity.HasQueryFilter(p => !p.IsDeleted);
            });
            // ====================================================
            // PRODUCT IMAGE
            // ====================================================
            modelBuilder.Entity<ProductImage>()
                .Property(pi => pi.ImageUrl)
                .HasMaxLength(500);

            modelBuilder.Entity<ProductImage>()
                .HasIndex(pi => new { pi.ProductId, pi.IsPrimary })
                .HasFilter("\"IsPrimary\" = true")
                .IsUnique();

            modelBuilder.Entity<ProductImage>()
                .HasQueryFilter(pi => !pi.IsDeleted);

            // ====================================================
            // PRODUCT TYPE
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


            // ====================================================
            // CUSTOMER
            // ====================================================
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasIndex(c => c.CustomerCode)
                    .IsUnique();

                entity.Property(c => c.CustomerCode)
                    .HasMaxLength(50);

                entity.Property(c => c.CustomerName)
                    .HasMaxLength(150);

                entity.Property(c => c.Status)
                    .HasMaxLength(20);

                entity.HasOne(c => c.AccountSubGroup)
                    .WithMany()
                    .HasForeignKey(c => c.AccountSubGroupId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasQueryFilter(c => !c.IsDeleted);
            });
            // ====================================================
            // SUPPLIER
            // ====================================================
            modelBuilder.Entity<Supplier>(entity =>
            {
                entity.HasIndex(s => s.SupplierCode)
                    .IsUnique();

                entity.Property(s => s.SupplierCode)
                    .HasMaxLength(50);

                entity.Property(s => s.SupplierName)
                    .HasMaxLength(150);

                entity.Property(s => s.Status)
                    .HasMaxLength(20);

                entity.HasOne(s => s.AccountSubGroup)
                    .WithMany()   // Supplier is ledger, no reverse navigation needed
                    .HasForeignKey(s => s.AccountSubGroupId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasQueryFilter(s => !s.IsDeleted);
            });

            // ====================================================
            // PURCHASE ORDER
            // ====================================================

            modelBuilder.Entity<PurchaseOrder>(entity =>
            {
                // ------------------------------
                // UNIQUE INDEX
                // ------------------------------
                entity.HasIndex(p => p.OrderNo)
                    .IsUnique();

                // ------------------------------
                // FIELD CONFIGURATION
                // ------------------------------

                entity.Property(p => p.OrderNo)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(p => p.Notes)
                    .HasMaxLength(1000);   // ✅ NEW (Remarks / Notes)

                entity.Property(p => p.ProductValue)
                    .HasColumnType("numeric(18,2)");

                entity.Property(p => p.Transportation)
                    .HasColumnType("numeric(18,2)");

                entity.Property(p => p.Discount)
                    .HasColumnType("numeric(18,2)");

                entity.Property(p => p.TotalAmount)
                    .HasColumnType("numeric(18,2)");

                entity.Property(p => p.Status)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(p => p.CreatedAt)
                    .HasColumnType("timestamp with time zone");

                // ------------------------------
                // RELATION → SUPPLIER
                // ------------------------------
                entity.HasOne(p => p.Supplier)
                    .WithMany()
                    .HasForeignKey(p => p.SupplierId)
                    .OnDelete(DeleteBehavior.Restrict);

                // ------------------------------
                // RELATION → ITEMS
                // ------------------------------
                entity.HasMany(p => p.Items)
                    .WithOne(i => i.PurchaseOrder)
                    .HasForeignKey(i => i.PurchaseOrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                // ------------------------------
                // SOFT DELETE
                // ------------------------------
                entity.HasQueryFilter(p => !p.IsDeleted);
            });

            // ====================================================
            // PURCHASE ORDER ITEM
            // ====================================================

            modelBuilder.Entity<PurchaseOrderItem>(entity =>
            {
                // ------------------------------
                // FIELD CONFIGURATION
                // ------------------------------
                entity.Property(i => i.Rate)
                    .HasColumnType("numeric(18,2)");

                entity.Property(i => i.Amount)
                    .HasColumnType("numeric(18,2)");

                // ------------------------------
                // RELATION → PRODUCT
                // ------------------------------
                entity.HasOne(i => i.Product)
                    .WithMany()
                    .HasForeignKey(i => i.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });


            // ====================================================
            // PURCHASE INVOICE
            // ====================================================

            modelBuilder.Entity<PurchaseInvoice>(entity =>
            {
                // ------------------------------
                // UNIQUE INDEX
                // ------------------------------
                entity.HasIndex(p => p.InvoiceNo)
                    .IsUnique();

                // ⭐ VERY IMPORTANT FOR INVENTORY PERFORMANCE
                entity.HasIndex(p => p.WarehouseId);

                // ------------------------------
                // FIELD CONFIGURATION
                // ------------------------------

                entity.Property(p => p.InvoiceNo)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(p => p.Notes)
                    .HasMaxLength(1000);

                entity.Property(p => p.ProductValue)
                    .HasColumnType("numeric(18,2)");

                entity.Property(p => p.TotalAmount)
                    .HasColumnType("numeric(18,2)");

                entity.Property(p => p.Status)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(p => p.CreatedAt)
                    .HasColumnType("timestamp with time zone");

                // ------------------------------
                // RELATION → SUPPLIER
                // ------------------------------
                entity.HasOne(p => p.Supplier)
                    .WithMany()
                    .HasForeignKey(p => p.SupplierId)
                    .OnDelete(DeleteBehavior.Restrict);

                // ------------------------------
                // ⭐ RELATION → WAREHOUSE (NEW ERP CORE)
                // ------------------------------
                entity.HasOne(p => p.Warehouse)
                    .WithMany()
                    .HasForeignKey(p => p.WarehouseId)
                    .OnDelete(DeleteBehavior.Restrict);

                // ------------------------------
                // RELATION → ITEMS
                // ------------------------------
                entity.HasMany(p => p.Items)
                    .WithOne(i => i.PurchaseInvoice)
                    .HasForeignKey(i => i.PurchaseInvoiceId)
                    .OnDelete(DeleteBehavior.Cascade);

                // ------------------------------
                // SOFT DELETE
                // ------------------------------
                entity.HasQueryFilter(p => !p.IsDeleted);
            });

            // ====================================================
            // PURCHASE INVOICE ITEM
            // ====================================================

            modelBuilder.Entity<PurchaseInvoiceItem>(entity =>
            {
                // ------------------------------
                // FIELD CONFIGURATION
                // ------------------------------
                entity.Property(i => i.Rate)
                    .HasColumnType("numeric(18,2)");

                entity.Property(i => i.Amount)
                    .HasColumnType("numeric(18,2)");

                // ------------------------------
                // RELATION → PRODUCT
                // ------------------------------
                entity.HasOne(i => i.Product)
                    .WithMany()
                    .HasForeignKey(i => i.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });


            // ====================================================
            // ONLINE ORDER
            // ====================================================
            modelBuilder.Entity<OnlineOrder>()
                .HasIndex(o => o.OrderNo)
                .IsUnique();

            modelBuilder.Entity<OnlineOrder>()
                .Property(o => o.SubTotal).HasColumnType("numeric(18,2)");

            modelBuilder.Entity<OnlineOrder>()
                .Property(o => o.DeliveryCharge).HasColumnType("numeric(18,2)");

            modelBuilder.Entity<OnlineOrder>()
                .Property(o => o.TotalAmount).HasColumnType("numeric(18,2)");

            modelBuilder.Entity<OnlineOrder>()
                .HasMany(o => o.Items)
                .WithOne(i => i.OnlineOrder)
                .HasForeignKey(i => i.OnlineOrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OnlineOrder>()
                .HasQueryFilter(o => !o.IsDeleted);

            // ====================================================
            // ONLINE ORDER ITEM
            // ====================================================
            modelBuilder.Entity<OnlineOrderItem>()
                .Property(i => i.UnitPrice)
                .HasColumnType("numeric(18,2)");

            modelBuilder.Entity<OnlineOrderItem>()
                .Property(i => i.LineTotal)
                .HasColumnType("numeric(18,2)");

            // ====================================================
            // PRODUCT SALE PRICE
            // ====================================================
            modelBuilder.Entity<ProductSalePrice>(entity =>
            {
                entity.Property(p => p.Price)
                    .HasColumnType("numeric(18,2)");

                entity.Property(p => p.Status)
                    .HasMaxLength(20);

                // ✅ FIX RELATIONSHIP EXPLICITLY
                entity.HasOne(p => p.Product)
                    .WithMany() // or .WithMany(p => p.ProductSalePrices) if you add collection
                    .HasForeignKey(p => p.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Index for product lookup
                entity.HasIndex(p => p.ProductId);

                // Only ONE current price per product
                entity.HasIndex(p => new { p.ProductId, p.IsCurrent })
                    .HasFilter("\"IsCurrent\" = true")
                    .IsUnique();
            });
            // ====================================================
            // USER
            // ====================================================
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // ====================================================
            // COMPANY
            // ====================================================
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.CompanyCode)
                .IsUnique();

            modelBuilder.Entity<Company>()
                .Property(c => c.CompanyCode).HasMaxLength(50);

            modelBuilder.Entity<Company>()
                .Property(c => c.CompanyName).HasMaxLength(200);

            modelBuilder.Entity<Company>()
                .Property(c => c.Bin).HasMaxLength(50);

            modelBuilder.Entity<Company>()
                .HasQueryFilter(c => !c.IsDeleted);

            // ====================================================
            // BRANCH
            // ====================================================
            modelBuilder.Entity<Branch>()
                .HasIndex(b => b.BranchCode)
                .IsUnique();

            modelBuilder.Entity<Branch>()
                .Property(b => b.BranchCode).HasMaxLength(50);

            modelBuilder.Entity<Branch>()
                .Property(b => b.BranchName).HasMaxLength(200);

            modelBuilder.Entity<Branch>()
                .HasOne(b => b.Company)
                .WithMany(c => c.Branches)
                .HasForeignKey(b => b.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Branch>()
                .HasMany(b => b.Warehouses)
                .WithOne(w => w.Branch)
                .HasForeignKey(w => w.BranchId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Branch>()
                .HasQueryFilter(b => !b.IsDeleted);

            // ====================================================
            // WAREHOUSE
            // ====================================================
            modelBuilder.Entity<Warehouse>()
                .HasIndex(w => w.WarehouseCode)
                .IsUnique();

            modelBuilder.Entity<Warehouse>()
                .Property(w => w.WarehouseCode).HasMaxLength(50);

            modelBuilder.Entity<Warehouse>()
                .Property(w => w.WarehouseName).HasMaxLength(200);

            modelBuilder.Entity<Warehouse>()
                .HasOne(w => w.Company)
                .WithMany(c => c.Warehouses)
                .HasForeignKey(w => w.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Warehouse>()
                .HasOne(w => w.Branch)
                .WithMany(b => b.Warehouses)
                .HasForeignKey(w => w.BranchId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Warehouse>()
                .HasQueryFilter(w => !w.IsDeleted);



            // d====================================================
            // CONFIGURATION
            // ====================================================
            modelBuilder.Entity<ConfigurationSetting>(entity =>
            {
                entity.ToTable("ConfigurationSettings");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Module)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(x => x.ConfigurationCode)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasIndex(x => x.ConfigurationCode)
                    .IsUnique();

                entity.Property(x => x.ConfigurationName)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(x => x.IsEnabled)
                    .IsRequired();

                entity.Property(x => x.Remarks)
                    .HasMaxLength(500);

                entity.Property(x => x.IsDeleted)
                    .HasDefaultValue(false);

                entity.Property(x => x.CreatedBy)
                    .HasMaxLength(100);

                entity.Property(x => x.UpdatedBy)
                    .HasMaxLength(100);
            });

            // ====================================================
            // ACCOUNT CLASS
            // ====================================================
            modelBuilder.Entity<AccountClass>()
                .HasIndex(a => a.ClassCode)
                .IsUnique();

            modelBuilder.Entity<AccountClass>()
                .Property(a => a.ClassCode).HasMaxLength(50);

            modelBuilder.Entity<AccountClass>()
                .Property(a => a.ClassName).HasMaxLength(150);

            modelBuilder.Entity<AccountClass>()
                .Property(a => a.ClassMode).HasMaxLength(10);

            modelBuilder.Entity<AccountClass>()
                .Property(a => a.Status).HasMaxLength(20);

            modelBuilder.Entity<AccountClass>()
                .HasQueryFilter(a => !a.IsDeleted);

            // ====================================================
            // ACCOUNT GROUP
            // ====================================================
            modelBuilder.Entity<AccountGroup>(entity =>
            {
                entity.HasIndex(g => g.GroupCode)
                    .IsUnique();

                entity.Property(g => g.GroupCode)
                    .HasMaxLength(20);

                entity.Property(g => g.GroupName)
                    .HasMaxLength(150);

                entity.Property(g => g.Status)
                    .HasMaxLength(20);

                entity.HasOne(g => g.AccountClass)
                    .WithMany(c => c.AccountGroups)
                    .HasForeignKey(g => g.AccountClassId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasQueryFilter(g => !g.IsDeleted);
            });

            // ====================================================
            // ACCOUNT SUB GROUP
            // ====================================================
            modelBuilder.Entity<AccountSubGroup>(entity =>
            {
                entity.HasIndex(s => s.SubGroupCode)
                    .IsUnique();

                entity.Property(s => s.SubGroupCode)
                    .HasMaxLength(50);

                entity.Property(s => s.SubGroupName)
                    .HasMaxLength(150);

                entity.Property(s => s.Status)
                    .HasMaxLength(20);

                entity.HasOne(s => s.AccountGroup)
                    .WithMany(g => g.AccountSubGroups)
                    .HasForeignKey(s => s.GroupId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasQueryFilter(s => !s.IsDeleted);
            });

            // ====================================================
            // GENERAL LEDGER
            // ====================================================
            modelBuilder.Entity<GeneralLedger>(entity =>
            {
                entity.HasIndex(l => l.LedgerCode)
                    .IsUnique();

                entity.Property(l => l.LedgerCode)
                    .HasMaxLength(50);

                entity.Property(l => l.LedgerName)
                    .HasMaxLength(150);

                entity.Property(l => l.Status)
                    .HasMaxLength(20);

                entity.HasOne(l => l.AccountSubGroup)
                    .WithMany()
                    .HasForeignKey(l => l.SubGroupId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasQueryFilter(l => !l.IsDeleted);
            });

            // ====================================================
            // CASH ACCOUNT
            // ====================================================
            modelBuilder.Entity<CashAccount>(entity =>
            {
                // ---------- UNIQUE INDEX ----------
                entity.HasIndex(c => c.AccountCode)
                    .IsUnique();

                // ---------- FIELD LENGTHS ----------
                entity.Property(c => c.AccountCode)
                    .HasMaxLength(50);

                entity.Property(c => c.AccountName)
                    .HasMaxLength(150);

                entity.Property(c => c.CashAccountName)
                    .HasMaxLength(200);

                entity.Property(c => c.Status)
                    .HasMaxLength(20);

                entity.Property(c => c.Remarks)
                    .HasMaxLength(500);

                entity.Property(c => c.CreatedBy)
                    .HasMaxLength(100);

                entity.Property(c => c.UpdatedBy)
                    .HasMaxLength(100);

                // ---------- RELATIONSHIP → Branch ----------
                entity.HasOne(c => c.Branch)
                    .WithMany() // No reverse navigation needed
                    .HasForeignKey(c => c.BranchId)
                    .OnDelete(DeleteBehavior.Restrict);

                // ---------- RELATIONSHIP → AccountSubGroup ----------
                entity.HasOne(c => c.AccountSubGroup)
                    .WithMany()
                    .HasForeignKey(c => c.SubGroupId)
                    .OnDelete(DeleteBehavior.Restrict);

                // ---------- SOFT DELETE ----------
                entity.HasQueryFilter(c => !c.IsDeleted);
            });


            // ====================================================
            // BANK ACCOUNT
            // ====================================================
            modelBuilder.Entity<BankAccount>(entity =>
            {
                entity.HasIndex(b => b.AccountCode)
                    .IsUnique();

                entity.Property(b => b.AccountCode)
                    .HasMaxLength(50);

                entity.Property(b => b.AccountName)
                    .HasMaxLength(150);

                entity.Property(b => b.BankAccountName)
                    .HasMaxLength(200);

                entity.Property(b => b.BankBranchName)
                    .HasMaxLength(150);

                entity.Property(b => b.BankShortBranchName)
                    .HasMaxLength(50);

                entity.Property(b => b.Status)
                    .HasMaxLength(20);

                entity.Property(b => b.Remarks)
                    .HasMaxLength(500);

                entity.Property(b => b.CreatedBy)
                    .HasMaxLength(100);

                entity.Property(b => b.UpdatedBy)
                    .HasMaxLength(100);

                entity.HasOne(b => b.Branch)
                    .WithMany()
                    .HasForeignKey(b => b.BranchId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.AccountSubGroup)
                    .WithMany()
                    .HasForeignKey(b => b.SubGroupId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasQueryFilter(b => !b.IsDeleted);
            });


            // ====================================================
            // MFS ACCOUNT
            // ====================================================
            modelBuilder.Entity<MfsAccount>(entity =>
            {
                entity.HasIndex(m => m.AccountCode)
                    .IsUnique();

                entity.Property(m => m.AccountCode).HasMaxLength(50);
                entity.Property(m => m.AccountName).HasMaxLength(150);
                entity.Property(m => m.ShortAccountName).HasMaxLength(100);
                entity.Property(m => m.WalletOrMerchantNumber).HasMaxLength(50);
                entity.Property(m => m.MfsLedgerName).HasMaxLength(200);
                entity.Property(m => m.Status).HasMaxLength(20);
                entity.Property(m => m.Remarks).HasMaxLength(500);

                entity.HasOne(m => m.Branch)
                    .WithMany()
                    .HasForeignKey(m => m.BranchId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.AccountSubGroup)
                    .WithMany()
                    .HasForeignKey(m => m.SubGroupId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.LinkedBankAccount)
                    .WithMany()
                    .HasForeignKey(m => m.LinkedBankAccountId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasQueryFilter(m => !m.IsDeleted);
            });
            // ====================================================
            // POS ACCOUNT
            // ====================================================
            modelBuilder.Entity<PosAccount>(entity =>
            {
                entity.HasIndex(p => p.AccountCode)
                    .IsUnique();

                entity.Property(p => p.AccountCode).HasMaxLength(50);
                entity.Property(p => p.AccountName).HasMaxLength(150);
                entity.Property(p => p.ShortAccountName).HasMaxLength(100);
                entity.Property(p => p.TerminalOrMerchantId).HasMaxLength(100);
                entity.Property(p => p.PosLedgerName).HasMaxLength(200);
                entity.Property(p => p.Status).HasMaxLength(20);
                entity.Property(p => p.Remarks).HasMaxLength(500);
                entity.Property(p => p.CreatedBy).HasMaxLength(100);
                entity.Property(p => p.UpdatedBy).HasMaxLength(100);

                entity.HasOne(p => p.Branch)
                    .WithMany()
                    .HasForeignKey(p => p.BranchId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.AccountSubGroup)
                    .WithMany()
                    .HasForeignKey(p => p.SubGroupId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.LinkedBankAccount)
                    .WithMany()
                    .HasForeignKey(p => p.LinkedBankAccountId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasQueryFilter(p => !p.IsDeleted);
            });
            // ====================================================
            // BANK SETUP
            // ====================================================
            modelBuilder.Entity<BankSetup>(entity =>
            {
                entity.HasIndex(b => b.BankCode)
                    .IsUnique();

                entity.Property(b => b.BankCode)
                    .HasMaxLength(20);

                entity.Property(b => b.BankName)
                    .HasMaxLength(150);

                entity.Property(b => b.ShortName)
                    .HasMaxLength(50);

                entity.Property(b => b.Status)
                    .HasMaxLength(20);

                entity.HasQueryFilter(b => !b.IsDeleted);
            });



            //====================================================
            // CARD CHARGES
            // ====================================================
            modelBuilder.Entity<CardCharge>(entity =>
            {
                // ------------------------------
                // FIELD CONFIGURATION
                // ------------------------------
                entity.Property(c => c.ChargePercent)
                    .HasColumnType("numeric(5,2)");

                entity.Property(c => c.Status)
                    .HasMaxLength(20);

                entity.Property(c => c.Remarks)
                    .HasMaxLength(500);

                entity.Property(c => c.CreatedBy)
                    .HasMaxLength(100);

                entity.Property(c => c.UpdatedBy)
                    .HasMaxLength(100);

                // ------------------------------
                // RELATION → POS ACCOUNT
                // ------------------------------
                entity.HasOne(c => c.PosLedger)
                    .WithMany()
                    .HasForeignKey(c => c.PosLedgerId)
                    .OnDelete(DeleteBehavior.Restrict);

                // ------------------------------
                // RELATION → CARD SETUP
                // ------------------------------
                entity.HasOne(c => c.CardSetup)
                    .WithMany()
                    .HasForeignKey(c => c.CardSetupId)
                    .OnDelete(DeleteBehavior.Restrict);

                // ------------------------------
                // SOFT DELETE
                // ------------------------------
                entity.HasQueryFilter(c => !c.IsDeleted);
            });

            // ====================================================
            // INVENTORY BATCH
            // ====================================================

            modelBuilder.Entity<InventoryBatch>(entity =>
            {
                entity.HasIndex(x => x.BatchNo)
                    .IsUnique();

                // ⭐ FIFO CORE INDEX
                entity.HasIndex(x =>
                    new { x.ProductId, x.WarehouseId, x.BatchStatus, x.BatchDate });

                // ⭐ FAST BALANCE CHECK INDEX
                entity.HasIndex(x =>
                    new { x.ProductId, x.WarehouseId, x.QtyBalance });

                // ⭐ SOURCE TRACE INDEX
                entity.HasIndex(x =>
                    new { x.SourceType, x.SourceId });

                entity.Property(x => x.BatchNo)
                    .HasMaxLength(30)
                    .IsRequired();

                entity.Property(x => x.SourceNo)
                    .HasMaxLength(50);

                entity.Property(x => x.CreatedBy)
                    .HasMaxLength(50);

                entity.HasQueryFilter(x => !x.IsDeleted);
            });
            // ====================================================
            // INVENTORY RESERVATION
            // ====================================================

            modelBuilder.Entity<InventoryReservation>(entity =>
            {
                // ⭐ ORDER LEVEL LOOKUP
                entity.HasIndex(x =>
                    new { x.SalesOrderId, x.ProductId });

                // ⭐ BATCH LEVEL LOCK
                entity.HasIndex(x =>
                    new { x.BatchId, x.ReservationStatus });

                // ⭐ WAREHOUSE STOCK FREEZE QUERY
                entity.HasIndex(x =>
                    new { x.ProductId, x.WarehouseId, x.ReservationStatus });

                entity.Property(x => x.SalesOrderNo)
                    .HasMaxLength(50);

                entity.Property(x => x.CreatedBy)
                    .HasMaxLength(50);

                entity.HasQueryFilter(x => !x.IsDeleted);
            });








        }


    }
}