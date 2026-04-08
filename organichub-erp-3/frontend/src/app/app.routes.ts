import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login';
import { LayoutComponent } from './layout/layout/layout';

/* =========================
   DASHBOARD
========================= */
import { DashboardComponent } from './pages/dashboard/dashboard';

/* =========================
   TEST PAGE
========================= */
import { TestPage } from './pages/test-page/test-page';

/* =========================
   PRODUCT
========================= */
import { ProductListPageComponent } from './pages/product-management/product-list-page/product-list-page';
import { ProductFormPageComponent } from './pages/product-management/product-form-page/product-form-page';
import { ProductCategoryListPageComponent } from './pages/product-management/product-category-list-page/product-category-list-page';
import { ProductCategoryFormPageComponent } from './pages/product-management/product-category-form-page/product-category-form-page';
import { ProductSubCategoryListPageComponent } from './pages/product-management/product-sub-category-list-page/product-sub-category-list-page';
import { ProductSubCategoryFormPageComponent } from './pages/product-management/product-sub-category-form-page/product-sub-category-form-page';

import { UnitSetupListPageComponent } from './pages/product-management/unit-setup-list-page/unit-setup-list-page';
import { UnitSetupFormPageComponent } from './pages/product-management/unit-setup-form-page/unit-setup-form-page';


import { ProductTypeListPageComponent } from './pages/product-management/product-type-list-page/product-type-list-page';
import { ProductTypeFormPageComponent } from './pages/product-management/product-type-form-page/product-type-form-page';

import { ProductSalePriceListPage } from './pages/product-management/product-sale-price-list-page/product-sale-price-list-page';
import { ProductSalePriceFormPage } from './pages/product-management/product-sale-price-form-page/product-sale-price-form-page';
/* =========================
   CLIENT
========================= */
import { SupplierListPageComponent } from './pages/client-management/supplier-list-page/supplier-list-page';
import { SupplierFormPageComponent } from './pages/client-management/supplier-form-page/supplier-form-page';
import { CustomerListPageComponent } from './pages/client-management/customer-list-page/customer-list-page';
import { CustomerFormPageComponent } from './pages/client-management/customer-form-page/customer-form-page';

/* =========================
   PURCHASE
========================= */
import { PurchaseOrderListPage } from './pages/purchase/purchase-order-list-page/purchase-order-list-page';
import { PurchaseOrderFormPage } from './pages/purchase/purchase-order-form-page/purchase-order-form-page';
import { PurchaseInvoiceListPage } from './pages/purchase/purchase-invoice-list-page/purchase-invoice-list-page';
import { PurchaseInvoiceFormPage } from './pages/purchase/purchase-invoice-form-page/purchase-invoice-form-page';
import { ProcessCostingListPageComponent } from './pages/purchase/process-costing-list-page/process-costing-list-page';
import { ProcessCostingFormPageComponent } from './pages/purchase/process-costing-form-page/process-costing-form-page';

import { PurchaseReturnListPage } from './pages/purchase/purchase-return-list-page/purchase-return-list-page';
import { PurchaseReturnFormPage } from './pages/purchase/purchase-return-form-page/purchase-return-form-page';

import { PurchaseOrderFormPageNewComponent } 
from './pages/purchase/purchase-order-form-page-new/purchase-order-form-page-new';
import { PurchaseInvoiceFormPageNewComponent } 
from './pages/purchase/purchase-invoice-form-page-new/purchase-invoice-form-page-new';

/* =========================
   SALES
========================= */
import { SalesQuotationListPage } from './pages/sales/sales-quotation-list-page/sales-quotation-list-page';
import { SalesQuotationFormPage } from './pages/sales/sales-quotation-form-page/sales-quotation-form-page';
import { SalesInvoiceListPage } from './pages/sales/sales-invoice-list-page/sales-invoice-list-page';
import { SalesInvoiceFormPage } from './pages/sales/sales-invoice-form-page/sales-invoice-form-page';
import { SalesReturnListPage } from './pages/sales/sales-return-list-page/sales-return-list-page';
import { SalesReturnFormPage } from './pages/sales/sales-return-form-page/sales-return-form-page';
import { OnlineOrdersListPageComponent } from './pages/sales/online-orders-list-page/online-orders-list-page';
import { OnlineOrdersViewPageComponent } from './pages/sales/online-orders-view-page/online-orders-view-page';



/* =========================
   GENERAL SETUP
========================= */
import { CompanySetupListPageComponent } from './pages/general-setup/company-setup-list-page/company-setup-list-page';
import { CompanySetupFormPageComponent } from './pages/general-setup/company-setup-form-page/company-setup-form-page';
import { BranchSetupListPageComponent } from './pages/general-setup/branch-setup-list-page/branch-setup-list-page';
import { BranchSetupFormPageComponent } from './pages/general-setup/branch-setup-form-page/branch-setup-form-page';
import { WarehouseSetupListPageComponent } from './pages/general-setup/warehouse-setup-list-page/warehouse-setup-list-page';
import { WarehouseSetupFormPageComponent } from './pages/general-setup/warehouse-setup-form-page/warehouse-setup-form-page';
import { ConfigurationSettingsPageComponent }
from './pages/general-setup/configuration-settings.page/configuration-settings.page';

/* =========================
   ACCOUNT SETUP
========================= */
import { AccountClassListPageComponent } from './pages/account-setup/account-class/account-class-list-page/account-class-list-page';
import { AccountClassFormPageComponent } from './pages/account-setup/account-class/account-class-form-page/account-class-form-page';

import { AccountGroupListPageComponent } from './pages/account-setup/account-group/account-group-list-page/account-group-list-page';
import { AccountGroupFormPageComponent } from './pages/account-setup/account-group/account-group-form-page/account-group-form-page';

import { AccountSubgroupListPageComponent } from './pages/account-setup/account-subgroup/account-subgroup-list-page/account-subgroup-list-page';
import { AccountSubgroupFormPageComponent } from './pages/account-setup/account-subgroup/account-sub-group-form-page/account-subgroup-form-page';

import { GeneralLedgerListPageComponent } from './pages/account-setup/general-ledger/general-ledger-list-page/general-ledger-list-page';
import { GeneralLedgerFormPageComponent } from './pages/account-setup/general-ledger/general-ledger-form-page/general-ledger-form-page';

import { CashAccountListPageComponent } from './pages/account-setup/cash-account/cash-account-list-page/cash-account-list-page';
import { CashAccountFormPageComponent } from './pages/account-setup/cash-account/cash-account-form-page/cash-account-form-page';

import { BankAccountListPageComponent } from './pages/account-setup/bank-account/bank-account-list-page/bank-account-list-page';
import { BankAccountFormPageComponent } from './pages/account-setup/bank-account/bank-account-form-page/bank-account-form-page';

import { PosAccountListPageComponent } from './pages/account-setup/pos-account/pos-account-list-page/pos-account-list-page';
import { PosAccountFormPageComponent } from './pages/account-setup/pos-account/pos-account-form-page/pos-account-form-page';

import { MfsAccountListPageComponent } from './pages/account-setup/mfs-account/mfs-account-list-page/mfs-account-list-page';
import { MfsAccountFormPageComponent } from './pages/account-setup/mfs-account/mfs-account-form-page/mfs-account-form-page';

import { BankSetupListPageComponent } from './pages/account-setup/bank-setup/bank-setup-list-page/bank-setup-list-page';
import { BankSetupFormPageComponent } from './pages/account-setup/bank-setup/bank-setup-form-page/bank-setup-form-page';

import { CardSetupListPageComponent } from './pages/account-setup/card-setup/card-setup-list-page/card-setup-list-page';
import { CardSetupFormPageComponent } from './pages/account-setup/card-setup/card-setup-form-page/card-setup-form-page';

import { CardChargesListPageComponent } from './pages/account-setup/card-charges/card-charges-list-page/card-charges-list-page';
import { CardChargesFormPageComponent } from './pages/account-setup/card-charges/card-charges-form-page/card-charges-form-page';


/* =========================
   INVOICE PRINT PAGES NEW
========================= */
import { PrintEngine } from './features/print/print-engine/print-engine';



/* =============================
   INVOICE PRINT PAGES - OLD
============================= */
import { PurchaseInvoicePrintPage } from './pages/Invoice/purchase-invoice/purchase-invoice-print-page/purchase-invoice-print-page';
import { SalesInvoicePrintPage } from './pages/Invoice/sales-invoice/sales-invoice-print-page/sales-invoice-print-page';
import { PurchaseOrderPrintPage } from './pages/Invoice/purchase-invoice/purchase-order-print-page/purchase-order-print-page';
import { PurchaseReturnPrintPage } from './pages/Invoice/purchase-invoice/purchase-return-print-page/purchase-return-print-page';


import { SalesQuotationPrintPage } from './pages/Invoice/sales-invoice/sales-quotation-print-page/sales-quotation-print-page';

import { SalesReturnPrintPage } from './pages/Invoice/sales-invoice/sales-return-print-page/sales-return-print-page';

import { CashLedgerComponent } from './pages/ledger/cash-ledger/cash-ledger';
import { BankLedgerComponent } from './pages/ledger/bank-ledger/bank-ledger';
import { MfsLedgerComponent } from './pages/ledger/mfs-ledger/mfs-ledger';
import { PosLedgerComponent } from './pages/ledger/pos-ledger/pos-ledger';

import { StockSummaryComponent } from './pages/store-management/stock-summary/stock-summary';


/* =========================
   REPORTS – LEDGER
========================= */

import { GeneralLedgerComponent } from './pages/ledger/general-ledger/general-ledger';
import { ProductLedgerComponent } from './pages/ledger/product-ledger/product-ledger';

import { InventoryDetailsComponent } from './pages/inventory/inventory-details/inventory-details';

import { BatchListPageComponent }
from './pages/inventory/batch-list-page/batch-list-page';
import { BatchLedgerPageComponent }
from './pages/inventory/batch-ledger-page/batch-ledger-page';

import { BatchMovement } from './pages/inventory/batch-movement/batch-movement';

import { AutoJournalComponent } from './pages/ledger/auto-journal/auto-journal';

import { ChartOfAccountsComponent } from './pages/reports/chart-of-accounts/chart-of-accounts';
import { ChartOfInventoryComponent } from './pages/reports/chart-of-inventory/chart-of-inventory';

export const routes: Routes = [

  // =========================
  // DEFAULT
  // =========================
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // =========================
  // LOGIN (NO LAYOUT)
  // =========================
  {
    path: 'login',
    component: LoginComponent
  },
  // =========================
  // PRINT ENGINE
  // =========================
  {
    path: 'print/:module/:id',
    loadComponent: () =>
      import('./features/print/print-engine/print-engine')
        .then(m => m.PrintEngine)
  },
  // =========================
  // MAIN ERP LAYOUT
  // =========================
  {
    path: '',
    component: LayoutComponent,
    children: [

      // Dashboard
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          breadcrumb: 'Dashboard',
          pageTitle: 'Dashboard',
          pageSubtitle: 'Welcome to Organic Hub'
        }
      },
  /* =========================
     TEST PAGE
  ========================= */
  {
    path: 'test-page',
    component: TestPage,
    data: {
      breadcrumb: 'Test Page',
      pageTitle: 'Test Page',
      pageSubtitle: 'Layout Test'
    }
  },

  /* =========================
     PRODUCT MASTER
  ========================= */
  {
    path: 'product',
    component: ProductListPageComponent,
    data: {
      breadcrumb: 'Product Management › Product Master',
      pageTitle: 'Product Master',
      pageSubtitle: 'Product Management'
    }
  },
  {
    path: 'product/form',
    component: ProductFormPageComponent,
    data: {
      breadcrumb: 'Product Management › Product Master › Form',
      pageTitle: 'Product Master',
      pageSubtitle: 'Product Management'
    }
  },
/* =========================
   PRODUCT – SALE PRICE
========================= */
{
  path: 'product/sale-price',
  component: ProductSalePriceListPage,
  data: {
    breadcrumb: 'Product Management › Product Sale Price',
    pageTitle: 'Product Sale Price',
    pageSubtitle: 'Product Management'
  }
},
{
  path: 'product/sale-price/form',
  component: ProductSalePriceFormPage,
  data: {
    breadcrumb: 'Product Management › Product Sale Price › Form',
    pageTitle: 'Product Sale Price',
    pageSubtitle: 'Product Management'
  }
},
  /* =========================
   PRODUCT – CATEGORY
  ========================= */
  {
    path: 'product-category',
    component: ProductCategoryListPageComponent,
    data: {
      breadcrumb: 'Product Management › Product Category',
      pageTitle: 'Product Category',
      pageSubtitle: 'Product Management'
    }
  },
  {
    path: 'product-category/form',
    component: ProductCategoryFormPageComponent,
    data: {
      breadcrumb: 'Product Management › Product Category › Form',
      pageTitle: 'Product Category',
      pageSubtitle: 'Product Management'
    }
  },

  /* =========================
   PRODUCT – SUB CATEGORY
  ========================= */
  {
    path: 'product/sub-category',
    component: ProductSubCategoryListPageComponent,
    data: {
      breadcrumb: 'Product Management › Product Sub Category',
      pageTitle: 'Product Sub Category',
      pageSubtitle: 'Product Management'
    }
  },
  {
    path: 'product/sub-category/form',
    component: ProductSubCategoryFormPageComponent,
    data: {
      breadcrumb: 'Product Management › Product Sub Category › Form',
      pageTitle: 'Product Sub Category',
      pageSubtitle: 'Product Management'
    }
  },
  /* =========================
     PRODUCT – UNIT SETUP
  ========================= */
  {
    path: 'product/unit-setup',
    component: UnitSetupListPageComponent,
    data: {
      breadcrumb: 'Product Management › Unit Setup',
      pageTitle: 'Unit Setup',
      pageSubtitle: 'Product Management'
    }
  },
  {
    path: 'product/unit-setup/form',
    component: UnitSetupFormPageComponent,
    runGuardsAndResolvers: 'always',
    data: {
      breadcrumb: 'Product Management › Unit Setup › Form',
      pageTitle: 'Unit Setup',
      pageSubtitle: 'Product Management'
    }
  },
  /* =========================
     PRODUCT TYPE SETUP
  ========================= */
    {
    path: 'product-type',
    component: ProductTypeListPageComponent,
    data: {
      breadcrumb: 'Product Management › Product Type',
      pageTitle: 'Product Type',
      pageSubtitle: 'Product Management'
    }
  },
  {
    path: 'product-type/form',
    component: ProductTypeFormPageComponent,
    data: {
      breadcrumb: 'Product Management › Product Type › Form',
      pageTitle: 'Product Type',
      pageSubtitle: 'Product Management'
    }
  },


  /* =========================
     CLIENT - SUPPLIER
  ========================= */
  {
    path: 'supplier',
    component: SupplierListPageComponent,
    data: {
      breadcrumb: 'Client Management › Supplier',
      pageTitle: 'Supplier Master',
      pageSubtitle: 'Client Management'
    }
  },
  {
    path: 'supplier/form',
    component: SupplierFormPageComponent,
    data: {
      breadcrumb: 'Client Management › Supplier › Form',
      pageTitle: 'Supplier Master',
      pageSubtitle: 'Client Management'
    }
  },

  /* =========================
     CLIENT - CUSTOMER
  ========================= */
  {
    path: 'customer',
    component: CustomerListPageComponent,
    data: {
      breadcrumb: 'Client Management › Customer',
      pageTitle: 'Customer Master',
      pageSubtitle: 'Client Management'
    }
  },
  {
    path: 'customer/form',
    component: CustomerFormPageComponent,
    data: {
      breadcrumb: 'Client Management › Customer › Form',
      pageTitle: 'Customer Master',
      pageSubtitle: 'Client Management'
    }
  },
  /* =========================
    PURCHASE
  ========================= */
  {
    path: 'purchase/order',
    component: PurchaseOrderListPage,
    data: {
      breadcrumb: 'Purchase › Purchase Order',
      pageTitle: 'Purchase Order',
      pageSubtitle: 'Purchase'
    }
  },
  {
    path: 'purchase/invoice',
    component: PurchaseInvoiceListPage,
    data: {
      breadcrumb: 'Purchase › Purchase Invoice',
      pageTitle: 'Purchase Invoice',
      pageSubtitle: 'Purchase'
    }
  },
  {
    path: 'purchase/process-costing',
    component: ProcessCostingListPageComponent,
    data: {
      breadcrumb: 'Purchase › Process Costing',
      pageTitle: 'Process Costing',
      pageSubtitle: 'Purchase'
    }
  },

  {
    path: 'purchase/return',
    component: PurchaseReturnListPage,
    data: {
      breadcrumb: 'Purchase › Purchase Return',
      pageTitle: 'Purchase Return',
      pageSubtitle: 'Purchase'
    }
  },
  {
    path: 'purchase/order/form',
    component: PurchaseOrderFormPageNewComponent,
    data: {
      breadcrumb: 'Purchase › Purchase Order › Form',
      pageTitle: 'Purchase Order',
      pageSubtitle: 'Purchase'
    }
  },

  {
    path: 'purchase/invoice/form',
    component: PurchaseInvoiceFormPageNewComponent,
    data: {
      breadcrumb: 'Purchase › Purchase Invoice › Form',
      pageTitle: 'Purchase Invoice',
      pageSubtitle: 'Purchase'
    }
  },
    {
    path: 'purchase/process-costing/form',
    component: ProcessCostingFormPageComponent,
    data: {
      breadcrumb: 'Purchase › Process Costing › Form',
      pageTitle: 'Process Costing',
      pageSubtitle: 'Purchase'
    }
  },
  {
    path: 'purchase/return/form',
    component: PurchaseReturnFormPage,
    data: {
      breadcrumb: 'Purchase › Purchase Return › Form',
      pageTitle: 'Purchase Return',
      pageSubtitle: 'Purchase'
    }
  },

  /* =========================
    SALES
  ========================= */
  {
    path: 'sales/quotation',
    component: SalesQuotationListPage,
    data: {
      breadcrumb: 'Sales › Sales Quotation',
      pageTitle: 'Sales Quotation',
      pageSubtitle: 'Sales'
    }
  },
  {
    path: 'sales/invoice',
    component: SalesInvoiceListPage,
    data: {
      breadcrumb: 'Sales › Sales Invoice',
      pageTitle: 'Sales Invoice',
      pageSubtitle: 'Sales'
    }
  },
  {
    path: 'sales/return',
    component: SalesReturnListPage,
    data: {
      breadcrumb: 'Sales › Sales Return',
      pageTitle: 'Sales Return',
      pageSubtitle: 'Sales'
    }
  },

  {
  path: 'sales/quotation/form',
  component: SalesQuotationFormPage,
  data: {
    breadcrumb: 'Sales › Sales Quotation › Form',
    pageTitle: 'Sales Quotation',
    pageSubtitle: 'Sales'
  }
  },
  {
    path: 'sales/invoice/form',
    component: SalesInvoiceFormPage,
    data: {
      breadcrumb: 'Sales › Sales Invoice › Form',
      pageTitle: 'Sales Invoice',
      pageSubtitle: 'Sales'
    }
  },
  {
    path: 'sales/return/form',
    component: SalesReturnFormPage,
    data: {
      breadcrumb: 'Sales › Sales Return › Form',
      pageTitle: 'Sales Return',
      pageSubtitle: 'Sales'
    }
  },

  {
  path: 'sales/online-orders',
  component: OnlineOrdersListPageComponent,
  data: {
    breadcrumb: 'Sales › Online Orders',
    pageTitle: 'Online Orders',
    pageSubtitle: 'Sales'
  }
  },
{
  path: 'sales/online-orders/view/:id',
  component: OnlineOrdersViewPageComponent,
  data: {
    breadcrumb: 'Sales › Online Orders › View',
    pageTitle: 'Online Order Details',
    pageSubtitle: 'Sales'
  }
},
  /* ========================={
    STORE MANAGEMENT
  ========================= */
  {
    path: 'store-management/stock-summary',
    component: StockSummaryComponent,
    data: {
      breadcrumb: 'Store Management › Stock Summary',
      pageTitle: 'Stock Summary',
      pageSubtitle: 'Store Management'
    }
  },
  {
    path: 'store-management/product-ledger',
    component: ProductLedgerComponent,
    data: {
      breadcrumb: 'Store Management › Product Ledger',
      pageTitle: 'Product Ledger',
      pageSubtitle: 'Store Management'
    }
  },
  {
    path: 'store-management/inventory-details',
    component: InventoryDetailsComponent,
    data: {
      breadcrumb: 'Store Management › Inventory Details',
      pageTitle: 'Inventory Details',
      pageSubtitle: 'Store Management'
    }
  },

  {
    path: 'store-management/batch-list',
    component: BatchListPageComponent,
    data: {
      breadcrumb: 'Store Management › Batch List',
      pageTitle: 'Batch List',
      pageSubtitle: 'Store Management'
    }
  },

  {
    path: 'store-management/batch-movement',
    component: BatchMovement,
    data: {
      breadcrumb: 'Store Management › Batch Movement',
      pageTitle: 'Batch Product Movement',
      pageSubtitle: 'Store Management'
    }
  },
  {
    path: 'store-management/batch-ledger/:id',
    component: BatchLedgerPageComponent,
    data: {
      breadcrumb: 'Store Management › Batch Ledger',
      pageTitle: 'Batch Ledger',
      pageSubtitle: 'Store Management'
    }
  },
  /* =========================
     GENERAL SETUP
  ========================= */
  {
    path: 'general-setup/company-setup',
    component: CompanySetupListPageComponent,
    data: {
      breadcrumb: 'General Setup › Company Setup',
      pageTitle: 'Company Setup',
      pageSubtitle: 'General Setup'
    }
  },
  {
    path: 'general-setup/company-setup/form',
    component: CompanySetupFormPageComponent,
    data: {
      breadcrumb: 'General Setup › Company Setup › Form',
      pageTitle: 'Company Setup',
      pageSubtitle: 'General Setup'
    }
  },
  {
    path: 'general-setup/branch-setup',
    component: BranchSetupListPageComponent,
    data: {
      breadcrumb: 'General Setup › Branch Setup',
      pageTitle: 'Branch Setup',
      pageSubtitle: 'General Setup'
    }
  },
  {
    path: 'general-setup/branch-setup/form',
    component: BranchSetupFormPageComponent,
    data: {
      breadcrumb: 'General Setup › Branch Setup › Form',
      pageTitle: 'Branch Setup',
      pageSubtitle: 'General Setup'
    }
  },
  {
    path: 'general-setup/warehouse-setup',
    component: WarehouseSetupListPageComponent,
    data: {
      breadcrumb: 'General Setup › Warehouse Setup',
      pageTitle: 'Warehouse Setup',
      pageSubtitle: 'General Setup'
    }
  },
  {
    path: 'general-setup/warehouse-setup/form',
    component: WarehouseSetupFormPageComponent,
    data: {
      breadcrumb: 'General Setup › Warehouse Setup › Form',
      pageTitle: 'Warehouse Setup',
      pageSubtitle: 'General Setup'
    }
  },
  {
    path: 'general-setup/configuration-settings',
    component: ConfigurationSettingsPageComponent,
    data: {
      breadcrumb: 'General Setup › Configuration Settings',
      pageTitle: 'Configuration Settings',
      pageSubtitle: 'General Setup'
    }
  },
  /* =========================
     ACCOUNT SETUP
  ========================= */
  {
    path: 'account-class',
    component: AccountClassListPageComponent,
    data: {
      breadcrumb: 'Account Setup › Account Class',
      pageTitle: 'Account Class',
      pageSubtitle: 'Account Setup'
    }
  },
  {
    path: 'account-class/form',
    component: AccountClassFormPageComponent,
    data: {
      breadcrumb: 'Account Setup › Account Class › Form',
      pageTitle: 'Account Class',
      pageSubtitle: 'Account Setup'
    }
  },
  {
    path: 'account-group',
    component: AccountGroupListPageComponent,
    data: {
      breadcrumb: 'Account Setup › Account Group',
      pageTitle: 'Account Group',
      pageSubtitle: 'Account Setup'
    }
  },
  {
    path: 'account-group/form',
    component: AccountGroupFormPageComponent,
    data: {
      breadcrumb: 'Account Setup › Account Group › Form',
      pageTitle: 'Account Group',
      pageSubtitle: 'Account Setup'
    }
  },

  /* ✅ ACCOUNT SUBGROUP — FIXED */
  {
    path: 'account-subgroup',
    component: AccountSubgroupListPageComponent,
    data: {
      breadcrumb: 'Account Setup › Account Sub-Group',
      pageTitle: 'Account Sub-Group',
      pageSubtitle: 'Account Setup'
    }
  },
  {
    path: 'account-subgroup/form',
    component: AccountSubgroupFormPageComponent,
    data: {
      breadcrumb: 'Account Setup › Account Sub-Group › Form',
      pageTitle: 'Account Sub-Group',
      pageSubtitle: 'Account Setup'
    }
  },

  /* =========================
   GENERAL LEDGER
  ========================= */
  {
    path: 'general-ledger',
    component: GeneralLedgerListPageComponent,
    data: {
      breadcrumb: 'Account Setup › General Ledger',
      pageTitle: 'General Ledger',
      pageSubtitle: 'Account Setup'
    }
  },
  {
    path: 'general-ledger/form',
    component: GeneralLedgerFormPageComponent,
    data: {
      breadcrumb: 'Account Setup › General Ledger › Form',
      pageTitle: 'General Ledger',
      pageSubtitle: 'Account Setup'
    }
  },

  /* =========================
   ACCOUNT SETUP – CASH ACCOUNT
  ========================= */
  {
    path: 'cash-account',
    component: CashAccountListPageComponent,
    data: {
      breadcrumb: 'Account Setup › Cash Account',
      pageTitle: 'Cash Account',
      pageSubtitle: 'Account Setup'
    }
  },
  {
    path: 'cash-account/form',
    component: CashAccountFormPageComponent,
    data: {
      breadcrumb: 'Account Setup › Cash Account › Form',
      pageTitle: 'Cash Account',
      pageSubtitle: 'Account Setup'
    }
  },

  {
  path: 'bank-account',
  component: BankAccountListPageComponent,
  data: {
    breadcrumb: 'Account Setup › Bank Account',
    pageTitle: 'Bank Account',
    pageSubtitle: 'Account Setup'
  }
  },
  {
    path: 'bank-account/form',
    component: BankAccountFormPageComponent,
    data: {
      breadcrumb: 'Account Setup › Bank Account › Form',
      pageTitle: 'Bank Account',
      pageSubtitle: 'Account Setup'
    }
  },

  /* =========================
    POS ACCOUNT
  ========================= */
  {
    path: 'pos-account',
    component: PosAccountListPageComponent,
    data: {
      breadcrumb: 'Account Setup › POS Account',
      pageTitle: 'POS Account',
      pageSubtitle: 'Account Setup'
    }
  },
  {
    path: 'pos-account/form',
    component: PosAccountFormPageComponent,
    data: {
      breadcrumb: 'Account Setup › POS Account › Form',
      pageTitle: 'POS Account',
      pageSubtitle: 'Account Setup'
    }
  },

  /* =========================
    MFS ACCOUNT
  ========================= */
  {
    path: 'mfs-account',
    component: MfsAccountListPageComponent,
    data: {
      breadcrumb: 'Account Setup › MFS Account',
      pageTitle: 'MFS Account',
      pageSubtitle: 'Account Setup'
    }
  },
  {
    path: 'mfs-account/form',
    component: MfsAccountFormPageComponent,
    data: {
      breadcrumb: 'Account Setup › MFS Account › Form',
      pageTitle: 'MFS Account',
      pageSubtitle: 'Account Setup'
    }
  },

  /* =========================
   BANK SETUP
  ========================= */
  {
    path: 'bank-setup',
    component: BankSetupListPageComponent,
    data: {
      breadcrumb: 'Account Setup › Bank Setup',
      pageTitle: 'Bank Setup',
      pageSubtitle: 'Account Setup'
    }
  },
  {
    path: 'bank-setup/form',
    component: BankSetupFormPageComponent,
    data: {
      breadcrumb: 'Account Setup › Bank Setup › Form',
      pageTitle: 'Bank Setup',
      pageSubtitle: 'Account Setup'
    }
  },

  /* =========================
    CARD SETUP
  ========================= */
  {
    path: 'card-setup',
    component: CardSetupListPageComponent,
    data: {
      breadcrumb: 'Account Setup › Card Setup',
      pageTitle: 'Card Setup',
      pageSubtitle: 'Account Setup'
    }
  },
  {
    path: 'card-setup/form',
    component: CardSetupFormPageComponent,
    data: {
      breadcrumb: 'Account Setup › Card Setup › Form',
      pageTitle: 'Card Setup',
      pageSubtitle: 'Account Setup'
    }
  },
  /* =========================
    CARD CHARGES
  ========================= */
  {
    path: 'card-charges',
    component: CardChargesListPageComponent,
    data: {
      breadcrumb: 'Account Setup › Card Charges',
      pageTitle: 'Card Charges',
      pageSubtitle: 'Account Setup'
    }
  },
  {
    path: 'card-charges/form',
    component: CardChargesFormPageComponent,
    data: {
      breadcrumb: 'Account Setup › Card Charges › Form',
      pageTitle: 'Card Charges',
      pageSubtitle: 'Account Setup'
    }
  },

  /* =========================
   INVOICE PRINT PAGES OLD
  =========================== */
  {
  path: 'purchase/invoice/print',
  component: PurchaseInvoicePrintPage,
  data: {
    breadcrumb: 'Purchase › Purchase Invoice › Print',
    pageTitle: 'Purchase Invoice',
    pageSubtitle: 'Purchase'
  }
  },

  {
  path: 'sales/invoice/print',
  component: SalesInvoicePrintPage,
  data: {
    breadcrumb: 'Sales › Sales Invoice › Print',
    pageTitle: 'Sales Invoice',
    pageSubtitle: 'Sales'
  }
  },
  {
    path: 'purchase/order/print',
    component: PurchaseOrderPrintPage,
    data: {
      breadcrumb: 'Purchase › Purchase Order › Print',
      pageTitle: 'Purchase Order',
      pageSubtitle: 'Purchase'
    }
  },
  {
    path: 'purchase/return/print',
    component: PurchaseReturnPrintPage,
    data: {
      breadcrumb: 'Purchase › Purchase Return › Print',
      pageTitle: 'Purchase Return',
      pageSubtitle: 'Purchase'
    }
  },
  {
    path: 'sales/quotation/print',
    component: SalesQuotationPrintPage,
    data: {
      breadcrumb: 'Sales › Sales Quotation › Print',
      pageTitle: 'Sales Quotation',
      pageSubtitle: 'Sales'
    }
  },
  {
    path: 'sales/invoice/return/print',
    component: SalesReturnPrintPage,
    data: {
      breadcrumb: 'Sales › Sales Return › Print',
      pageTitle: 'Sales Return',
      pageSubtitle: 'Sales'
    }
  },

  /* =========================
    REPORTS – GENERAL LEDGER
  ========================= */
  /* =========================
   REPORTS – CHART OF ACCOUNTS
  ========================= */
  {
    path: 'reports/chart-of-accounts',
    component: ChartOfAccountsComponent,
    data: {
      breadcrumb: 'Reports › Financial Reports › Chart of Accounts',
      pageTitle: 'Chart of Accounts',
      pageSubtitle: 'Financial Reports'
    }
  },

  /* =========================
    REPORTS – CHART OF INVENTORY
  ========================= */
  {
    path: 'reports/chart-of-inventory',
    component: ChartOfInventoryComponent,
    data: {
      breadcrumb: 'Reports › Inventory Reports › Chart of Inventory',
      pageTitle: 'Chart of Inventory',
      pageSubtitle: 'Inventory Reports'
    }
  },


  {
    path: 'reports/general-ledger',
    component: GeneralLedgerComponent,
    data: {
      breadcrumb: 'Reports › Financial Reports › General Ledger',
      pageTitle: 'General Ledger',
      pageSubtitle: 'Financial Reports'
    }
  },

  {
    path: 'reports/cash-ledger',
    component: CashLedgerComponent,
    data: {
      breadcrumb: 'Reports › Financial Reports › Cash Ledger',
      hidePageHeader: true
    }
  },
{
  path: 'reports/bank-ledger',
  component: BankLedgerComponent,
  data: {
    breadcrumb: 'Reports › Financial Reports › Bank Ledger',
    hidePageHeader: true
  }
},

{
  path: 'reports/mfs-ledger',
  component: MfsLedgerComponent,
  data: {
    breadcrumb: 'Reports › Financial Reports › MFS Ledger',
    hidePageHeader: true
  }
},
{
  path: 'reports/pos-ledger',
  component: PosLedgerComponent,
  data: {
    breadcrumb: 'Reports › Financial Reports › POS Ledger',
    hidePageHeader: true
  }
},
{
  path: 'reports/auto-journal',
  component: AutoJournalComponent,
  data: {
    breadcrumb: 'Reports › Financial Reports › Auto Journal',
    hidePageHeader: true
  }
},
/* =========================
   REPORTS – INVENTORY (PLACEHOLDERS)
========================= */
{
  path: 'reports/inventory-report-1',
  component: InventoryDetailsComponent,
  data: {
    breadcrumb: 'Reports › Inventory Reports › Inventory Report 1',
    pageTitle: 'Inventory Report 1',
    pageSubtitle: 'Inventory Reports'
  }
},
{
  path: 'reports/inventory-report-2',
  component: InventoryDetailsComponent,
  data: {
    breadcrumb: 'Reports › Inventory Reports › Inventory Report 2',
    pageTitle: 'Inventory Report 2',
    pageSubtitle: 'Inventory Reports'
  }
},
{
  path: 'reports/inventory-report-3',
  component: InventoryDetailsComponent,
  data: {
    breadcrumb: 'Reports › Inventory Reports › Inventory Report 3',
    pageTitle: 'Inventory Report 3',
    pageSubtitle: 'Inventory Reports'
  }
},
      // CLOSE children array
    ]
  },

  // GLOBAL FALLBACK
  { path: '**', redirectTo: 'login' }

];
