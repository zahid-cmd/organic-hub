import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // =====================================================
  // SYSTEM
  // =====================================================

  ping(message: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/ping`, { params: { message } });
  }

  health(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  getDashboardSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/summary`);
  }

  // =====================================================
  // GENERIC HELPER
  // =====================================================

  private get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  private post<T>(url: string, data: any): Observable<T> {
    return this.http.post<T>(url, data);
  }

  private put<T>(url: string, data: any): Observable<T> {
    return this.http.put<T>(url, data);
  }

  private delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
  // =====================================================
  // COMPANY
  // =====================================================

  private companyUrl = `${this.baseUrl}/Company`;

  getCompanies() {
    return this.get<any[]>(this.companyUrl);
  }

  getCompanyById(id: number) {
    return this.get<any>(`${this.companyUrl}/${id}`);
  }

  createCompany(data: any) {
    return this.post<any>(this.companyUrl, data);
  }

  updateCompany(id: number, data: any) {
    return this.put<any>(`${this.companyUrl}/${id}`, data);
  }

  deleteCompany(id: number) {
    return this.delete<any>(`${this.companyUrl}/${id}`);
  }

  getNextCompanyCode(): Observable<string> {
    return this.http.get(
      `${this.companyUrl}/next-code`,
      { responseType: 'text' }
    );
  }

  // =====================================================
  // BRANCH
  // =====================================================

  private branchUrl = `${this.baseUrl}/Branch`;

  getBranches() {
    return this.get<any[]>(this.branchUrl);
  }

  getBranchById(id: number) {
    return this.get<any>(`${this.branchUrl}/${id}`);
  }

  createBranch(data: any) {
    return this.post<any>(this.branchUrl, data);
  }

  updateBranch(id: number, data: any) {
    return this.put<any>(`${this.branchUrl}/${id}`, data);
  }

  deleteBranch(id: number) {
    return this.delete<any>(`${this.branchUrl}/${id}`);
  }

  getNextBranchCode(): Observable<string> {
    return this.http.get(
      `${this.branchUrl}/next-code`,
      { responseType: 'text' }
    );
  }

  // =====================================================
  // WAREHOUSE
  // =====================================================

  private warehouseUrl = `${this.baseUrl}/Warehouse`;

  getWarehouses() {
    return this.get<any[]>(this.warehouseUrl);
  }

  getWarehouseById(id: number) {
    return this.get<any>(`${this.warehouseUrl}/${id}`);
  }

  createWarehouse(data: any) {
    return this.post<any>(this.warehouseUrl, data);
  }

  updateWarehouse(id: number, data: any) {
    return this.put<any>(`${this.warehouseUrl}/${id}`, data);
  }

  deleteWarehouse(id: number) {
    return this.delete<any>(`${this.warehouseUrl}/${id}`);
  }

  getNextWarehouseCode() {
    return this.http.get(
      `${this.warehouseUrl}/next-code`,
      { responseType: 'text' }
    );
  }

  // ================= CATEGORY FILTER =================

  getCategoriesByProductType(productTypeId:number){
    return this.http.get<any[]>(
      `${this.baseUrl}/Category/by-product-type/${productTypeId}`
    );
  }


  // =====================================================
  // UNIT
  // =====================================================

  private unitUrl = `${this.baseUrl}/Unit`;

  getUnits() {
    return this.get<any[]>(this.unitUrl);
  }

  getUnitById(id: number) {
    return this.get<any>(`${this.unitUrl}/${id}`);
  }

  createUnit(data: any) {
    return this.post<any>(this.unitUrl, data);
  }

  updateUnit(id: number, data: any) {
    return this.put<any>(`${this.unitUrl}/${id}`, data);
  }

  deleteUnit(id: number) {
    return this.delete<any>(`${this.unitUrl}/${id}`);
  }

  // =====================================================
  // PRODUCT TYPE
  // =====================================================

  private productTypeUrl = `${this.baseUrl}/ProductType`;

  getProductTypes() {
    return this.get<any[]>(this.productTypeUrl);
  }

  getProductTypeById(id: number) {
    return this.get<any>(`${this.productTypeUrl}/${id}`);
  }

  createProductType(data: any) {
    return this.post<any>(this.productTypeUrl, data);
  }

  updateProductType(id: number, data: any) {
    return this.put<any>(`${this.productTypeUrl}/${id}`, data);
  }

  deleteProductType(id: number) {
    return this.delete<any>(`${this.productTypeUrl}/${id}`);
  }

  // =====================================================
  // CATEGORY
  // =====================================================

  private categoryUrl = `${this.baseUrl}/Category`;

  getCategories() {
    return this.get<any[]>(this.categoryUrl);
  }

  getCategoryById(id: number) {
    return this.get<any>(`${this.categoryUrl}/${id}`);
  }

  createCategory(data: any) {
    return this.post<any>(this.categoryUrl, data);
  }

  updateCategory(id: number, data: any) {
    return this.put<any>(`${this.categoryUrl}/${id}`, data);
  }

  deleteCategory(id: number) {
    return this.delete<any>(`${this.categoryUrl}/${id}`);
  }

  getNextCategoryCode(productTypeId: number): Observable<string> {
    return this.http.get(
      `${this.categoryUrl}/next-code/${productTypeId}`,
      { responseType: 'text' }
    );
  }

  // =====================================================
  // SUB CATEGORY
  // =====================================================

  private subCategoryUrl = `${this.baseUrl}/SubCategory`;

  getSubCategories() {
    return this.get<any[]>(this.subCategoryUrl);
  }

  getSubCategoryById(id: number) {
    return this.get<any>(`${this.subCategoryUrl}/${id}`);
  }

  getSubCategoriesByCategory(categoryId: number) {
    return this.get<any[]>(`${this.subCategoryUrl}/by-category/${categoryId}`);
  }

  createSubCategory(data: any) {
    return this.post<any>(this.subCategoryUrl, data);
  }

  updateSubCategory(id: number, data: any) {
    return this.put<any>(`${this.subCategoryUrl}/${id}`, data);
  }

  deleteSubCategory(id: number) {
    return this.delete<any>(`${this.subCategoryUrl}/${id}`);
  }

  getNextSubCategoryCode(categoryId: number): Observable<string> {
    return this.http.get(
      `${this.subCategoryUrl}/next-code/${categoryId}`,
      { responseType: 'text' }
    );
  }

  getSubCategoriesByProductType(productTypeId: number) {
    return this.http.get<any[]>(
      `${this.baseUrl}/SubCategory/by-product-type/${productTypeId}`
    );
  }

  // ⭐ SALEABLE SUB CATEGORY (PRICE FORM)
  getSaleableSubCategories() {
    return this.get<any[]>(
      `${this.subCategoryUrl}/saleable`
    );
  }
  // =====================================================
  // PRODUCT
  // =====================================================

  private productUrl = `${this.baseUrl}/Product`;

  getProducts() {
    return this.get<any[]>(this.productUrl);
  }

  getProductById(id: number) {
    return this.get<any>(`${this.productUrl}/${id}`);
  }

  createProduct(data: any) {
    return this.post<any>(this.productUrl, data);
  }

  updateProduct(id: number, data: any) {
    return this.put<any>(`${this.productUrl}/${id}`, data);
  }

  deleteProduct(id: number) {
    return this.delete<any>(`${this.productUrl}/${id}`);
  }

  getNextProductCode(subCategoryId: number): Observable<string> {
    return this.http.get(
      `${this.productUrl}/next-code/${subCategoryId}`,
      { responseType: 'text' }
    );
  }
  // 🔥 GET ONLY PURCHASABLE PRODUCTS
  getPurchasableProducts() {
    return this.get<any[]>(
      `${this.productUrl}/purchasable`
    );
  }

  getProductsBySubCategory(subCategoryId:number){
    return this.http.get<any[]>(
      `${this.productUrl}/by-subcategory/${subCategoryId}`
    );
  }
  // =====================================================
  // CUSTOMER
  // =====================================================

  private customerUrl = `${this.baseUrl}/customers`;

  getCustomers() {
    return this.get<any[]>(this.customerUrl);
  }

  getCustomerById(id: number) {
    return this.get<any>(`${this.customerUrl}/${id}`);
  }

  createCustomer(data: any) {
    return this.post<any>(this.customerUrl, data);
  }

  updateCustomer(id: number, data: any) {
    return this.put<any>(`${this.customerUrl}/${id}`, data);
  }

  deleteCustomer(id: number) {
    return this.delete<any>(`${this.customerUrl}/${id}`);
  }

  getNextCustomerCode(): Observable<string> {
    return this.http.get(
      `${this.customerUrl}/next-code`,
      { responseType: 'text' }
    );
  }

  getFixedCustomerSubGroup() {
    return this.get<any>(`${this.customerUrl}/fixed-subgroup`);
  }

  // =====================================================
  // SUPPLIER
  // =====================================================

  private supplierUrl = `${this.baseUrl}/suppliers`;

  getSuppliers() {
    return this.get<any[]>(this.supplierUrl);
  }

  getSupplierById(id: number) {
    return this.get<any>(`${this.supplierUrl}/${id}`);
  }

  createSupplier(data: any) {
    return this.post<any>(this.supplierUrl, data);
  }

  updateSupplier(id: number, data: any) {
    return this.put<any>(`${this.supplierUrl}/${id}`, data);
  }

  deleteSupplier(id: number) {
    return this.delete<any>(`${this.supplierUrl}/${id}`);
  }

  // 🔥 FIXED SUBGROUP (NEW)
  getFixedSupplierSubGroup() {
    return this.get<any>(`${this.supplierUrl}/fixed-subgroup`);
  }

  // NEXT CODE
  getNextSupplierCode(): Observable<string> {
    return this.http.get(
      `${this.supplierUrl}/next-code`,
      { responseType: 'text' }
    );
  }
  // =====================================================
  // ONLINE ORDERS (ERP + WEBSITE)
  // =====================================================

  private onlineOrderUrl = `${this.baseUrl}/online-orders`;

  // ================= ERP LIST =================

  getOnlineOrders() {
    return this.get<any[]>(this.onlineOrderUrl);
  }

  // ================= ERP VIEW =================

  getOnlineOrderById(id: number) {
    return this.get<any>(`${this.onlineOrderUrl}/${id}`);
  }

  // ================= CREATE (FROM WEBSITE) =================

  createOnlineOrder(data: any) {
    return this.post<any>(this.onlineOrderUrl, data);
  }

  // ================= UPDATE (Edit Before Confirmation) =================

  updateOnlineOrder(id: number, data: any) {
    return this.put<any>(`${this.onlineOrderUrl}/${id}`, data);
  }

  // ================= STATUS CHANGE =================

  updateOnlineOrderStatus(id: number, status: string) {
    return this.put<any>(
      `${this.onlineOrderUrl}/${id}/status`,
      { status }
    );
  }


  // =====================================================
  // PRODUCT SALE PRICE
  // =====================================================

  private productSalePriceUrl = `${this.baseUrl}/product-sale-price`;

  getProductSalePrices() {
    return this.http.get<any[]>(this.productSalePriceUrl);
  }

  getCurrentProductSalePrice(productId: number) {
    return this.http.get<any>(
      `${this.productSalePriceUrl}/current/${productId}`
    );
  }

  getProductSalePriceHistory(productId: number) {
    return this.http.get<any[]>(
      `${this.productSalePriceUrl}/history/${productId}`
    );
  }

  setProductSalePrice(data: any) {
    return this.http.post<any>(
      `${this.productSalePriceUrl}/set`,
      data
    );
  }

  // ⭐ PURCHASABLE SUB CATEGORY (FOR PURCHASE MODULE)
  getPurchasableSubCategories() {
    return this.get<any[]>(
      `${this.subCategoryUrl}/purchasable`
    );
  }
  // ==============================================
  // CONFIGURATION SETTINGS
  // ==============================================

  private configurationSettingsUrl =
    `${this.baseUrl}/general-setup/configuration-settings`;

  getConfigurationSettings() {
    return this.get<any[]>(this.configurationSettingsUrl);
  }

  getConfigurationSettingById(id: number) {
    return this.get<any>(`${this.configurationSettingsUrl}/${id}`);
  }

  createConfigurationSetting(data: any) {
    return this.post<any>(this.configurationSettingsUrl, data);
  }

  updateConfigurationSetting(id: number, data: any) {
    return this.put<any>(`${this.configurationSettingsUrl}/${id}`, data);
  }

  deleteConfigurationSetting(id: number) {
    return this.delete<any>(`${this.configurationSettingsUrl}/${id}`);
  }
  // =====================================================
  // PURCHASE ORDER
  // =====================================================

  private purchaseOrderUrl = `${this.baseUrl}/PurchaseOrder`;

  // LIST (used in Purchase Order module)
  getPurchaseOrders() {
    return this.get<any[]>(this.purchaseOrderUrl);
  }

  // LIST APPROVED (used in Purchase Invoice dropdown)
  getApprovedPurchaseOrders() {
    return this.get<any[]>(`${this.purchaseOrderUrl}/approved`);
  }

  // GET BY ID (Edit / View)
  getPurchaseOrderById(id: number) {
    return this.get<any>(`${this.purchaseOrderUrl}/${id}`);
  }

  // CREATE
  createPurchaseOrder(data: any) {
    return this.post<any>(this.purchaseOrderUrl, data);
  }

  // UPDATE
  updatePurchaseOrder(id: number, data: any) {
    return this.put<any>(`${this.purchaseOrderUrl}/${id}`, data);
  }

  // NEXT NUMBER
  getNextPurchaseOrderNumber() {
    return this.http.get(
      `${this.purchaseOrderUrl}/next-number`,
      { responseType: 'text' }
    );
  }

  // DELETE (soft delete)
  deletePurchaseOrder(id: number) {
    return this.delete<any>(`${this.purchaseOrderUrl}/${id}`);
  }


  // =====================================================
  // PURCHASE INVOICE
  // =====================================================

  private purchaseInvoiceUrl = `${this.baseUrl}/PurchaseInvoice`;

  // LIST
  getPurchaseInvoices() {
    return this.get<any[]>(this.purchaseInvoiceUrl);
  }

  // GET BY ID
  getPurchaseInvoiceById(id: number) {
    return this.get<any>(`${this.purchaseInvoiceUrl}/${id}`);
  }

  // CREATE
  createPurchaseInvoice(data: any) {
    return this.post<any>(this.purchaseInvoiceUrl, data);
  }

  // UPDATE
  updatePurchaseInvoice(id: number, data: any) {
    return this.put<any>(`${this.purchaseInvoiceUrl}/${id}`, data);
  }

  // DELETE
  deletePurchaseInvoice(id: number) {
    return this.delete<any>(`${this.purchaseInvoiceUrl}/${id}`);
  }

  // NEXT NUMBER
  getNextPurchaseInvoiceNumber() {
    return this.http.get(
      `${this.purchaseInvoiceUrl}/next-number`,
      { responseType: 'text' }
    );
  }
  // ⭐ LAST PURCHASE RATE
  getLastPurchaseRate(productId:number){
    return this.http.get<number>(
      `${this.purchaseInvoiceUrl}/last-rate/${productId}`
    );
  }

  // =====================================================
  // PRODUCT IMAGE  ✅ NEW SECTION
  // =====================================================

  private productImageUrl = `${this.baseUrl}/ProductImage`;

  // Get images by product
  getProductImages(productId: number) {
    return this.get<any[]>(
      `${this.productImageUrl}/by-product/${productId}`
    );
  }

  // Upload image
  uploadProductImage(productId: number, formData: FormData) {
    return this.http.post(
      `${this.productImageUrl}/upload/${productId}`,
      formData
    );
  }

  // Set primary image
  setPrimaryProductImage(imageId: number) {
    return this.put<any>(
      `${this.productImageUrl}/set-primary/${imageId}`,
      {}
    );
  }

  // Delete image (soft delete)
  deleteProductImage(imageId: number) {
    return this.delete<any>(
      `${this.productImageUrl}/${imageId}`
    );
  }

  uploadCompanyLogo(id: number, formData: FormData) {
    return this.http.post(
      `${this.baseUrl}/Company/${id}/upload-logo`,
      formData
    );
  }

  // =====================================================
  // ACCOUNT CLASS
  // =====================================================

  private accountClassUrl = `${this.baseUrl}/account-classes`;

  getAccountClasses() {
    return this.get<any[]>(this.accountClassUrl);
  }

  getAccountClassById(id: number) {
    return this.get<any>(`${this.accountClassUrl}/${id}`);
  }

  createAccountClass(data: any) {
    return this.post<any>(this.accountClassUrl, data);
  }

  updateAccountClass(id: number, data: any) {
    return this.put<any>(`${this.accountClassUrl}/${id}`, data);
  }

  deleteAccountClass(id: number) {
    return this.delete<any>(`${this.accountClassUrl}/${id}`);
  }

  getNextAccountClassCode(): Observable<string> {
    return this.http.get(
      `${this.accountClassUrl}/next-code`,
      { responseType: 'text' }
    );
  }

  // ==============================================
  // ACCOUNT GROUP
  // ==============================================

  private accountGroupUrl = `${this.baseUrl}/account-groups`;

  getAccountGroups() {
    return this.get<any[]>(this.accountGroupUrl);
  }

  getAccountGroupById(id: number) {
    return this.get<any>(`${this.accountGroupUrl}/${id}`);
  }

  getNextAccountGroupCode(classId: number) {
    return this.http.get(
      `${this.accountGroupUrl}/next-code/${classId}`,
      { responseType: 'text' }
    );
  }

  createAccountGroup(payload: any) {
    return this.post<any>(this.accountGroupUrl, payload);
  }

  updateAccountGroup(id: number, payload: any) {
    return this.put<any>(`${this.accountGroupUrl}/${id}`, payload);
  }

  deleteAccountGroup(id: number) {
    return this.delete<any>(`${this.accountGroupUrl}/${id}`);
  }



  // ==============================================
  // ACCOUNT SUB GROUP
  // ==============================================

  private accountSubGroupUrl = `${this.baseUrl}/account-subgroups`;

  getAccountSubGroups() {
    return this.get<any[]>(this.accountSubGroupUrl);
  }

  getAccountSubGroupById(id: number) {
    return this.get<any>(`${this.accountSubGroupUrl}/${id}`);
  }

  getNextAccountSubGroupCode(groupId: number) {
    return this.http.get(
      `${this.accountSubGroupUrl}/next-code/${groupId}`,
      { responseType: 'text' }
    );
  }

  createAccountSubGroup(payload: any) {
    return this.post<any>(this.accountSubGroupUrl, payload);
  }

  updateAccountSubGroup(id: number, payload: any) {
    return this.put<any>(`${this.accountSubGroupUrl}/${id}`, payload);
  }

  deleteAccountSubGroup(id: number) {
    return this.delete<any>(`${this.accountSubGroupUrl}/${id}`);
  }

  // ==============================================
  // GENERAL LEDGER
  // ==============================================

  private generalLedgerUrl = `${this.baseUrl}/general-ledgers`;

  getGeneralLedgers() {
    return this.get<any[]>(this.generalLedgerUrl);
  }

  getGeneralLedgerById(id: number) {
    return this.get<any>(`${this.generalLedgerUrl}/${id}`);
  }

  getNextGeneralLedgerCode(subGroupId: number) {
    return this.http.get(
      `${this.generalLedgerUrl}/next-code/${subGroupId}`,
      { responseType: 'text' }
    );
  }

  createGeneralLedger(payload: any) {
    return this.post<any>(this.generalLedgerUrl, payload);
  }

  updateGeneralLedger(id: number, payload: any) {
    return this.put<any>(`${this.generalLedgerUrl}/${id}`, payload);
  }

  deleteGeneralLedger(id: number) {
    return this.delete<any>(`${this.generalLedgerUrl}/${id}`);
  }

  // ==============================================
  // CASH ACCOUNT
  // ==============================================

  private cashAccountUrl = `${this.baseUrl}/cash-accounts`;

  getCashAccounts() {
    return this.get<any[]>(this.cashAccountUrl);
  }

  getCashAccountById(id: number) {
    return this.get<any>(`${this.cashAccountUrl}/${id}`);
  }

  getNextCashAccountCode() {
    return this.http.get(
      `${this.cashAccountUrl}/next-code`,
      { responseType: 'text' }
    );
  }

  createCashAccount(payload: any) {
    return this.post<any>(this.cashAccountUrl, payload);
  }

  updateCashAccount(id: number, payload: any) {
    return this.put<any>(`${this.cashAccountUrl}/${id}`, payload);
  }

  deleteCashAccount(id: number) {
    return this.delete<any>(`${this.cashAccountUrl}/${id}`);
  }



  // ==============================================
  // BANK ACCOUNT
  // ==============================================

  private bankAccountUrl = `${this.baseUrl}/bank-accounts`;

  getBankAccounts() {
    return this.get<any[]>(this.bankAccountUrl);
  }

  getBankAccountById(id: number) {
    return this.get<any>(`${this.bankAccountUrl}/${id}`);
  }

  getNextBankAccountCode() {
    return this.http.get(
      `${this.bankAccountUrl}/next-code`,
      { responseType: 'text' }
    );
  }

  createBankAccount(payload: any) {
    return this.post<any>(this.bankAccountUrl, payload);
  }

  updateBankAccount(id: number, payload: any) {
    return this.put<any>(`${this.bankAccountUrl}/${id}`, payload);
  }

  deleteBankAccount(id: number) {
    return this.delete<any>(`${this.bankAccountUrl}/${id}`);
  }

  // ==============================================
  // MFS ACCOUNT
  // ==============================================

  private mfsAccountUrl = `${this.baseUrl}/mfs-accounts`;

  getMfsAccounts() {
    return this.get<any[]>(this.mfsAccountUrl);
  }

  getMfsAccountById(id: number) {
    return this.get<any>(`${this.mfsAccountUrl}/${id}`);
  }

  getNextMfsAccountCode() {
    return this.http.get(
      `${this.mfsAccountUrl}/next-code`,
      { responseType: 'text' }
    );
  }

  createMfsAccount(payload: any) {
    return this.post<any>(this.mfsAccountUrl, payload);
  }

  updateMfsAccount(id: number, payload: any) {
    return this.put<any>(`${this.mfsAccountUrl}/${id}`, payload);
  }

  deleteMfsAccount(id: number) {
    return this.delete<any>(`${this.mfsAccountUrl}/${id}`);
  }

  // ==============================================
  // POS ACCOUNT
  // ==============================================

  private posAccountUrl = `${this.baseUrl}/pos-accounts`;

  getPosAccounts() {
    return this.get<any[]>(this.posAccountUrl);
  }

  getPosAccountById(id: number) {
    return this.get<any>(`${this.posAccountUrl}/${id}`);
  }

  getNextPosAccountCode() {
    return this.http.get(
      `${this.posAccountUrl}/next-code`,
      { responseType: 'text' }
    );
  }

  createPosAccount(payload: any) {
    return this.post<any>(this.posAccountUrl, payload);
  }

  updatePosAccount(id: number, payload: any) {
    return this.put<any>(`${this.posAccountUrl}/${id}`, payload);
  }

  deletePosAccount(id: number) {
    return this.delete<any>(`${this.posAccountUrl}/${id}`);
  }
  // ==========================================
  // BANK SETUP APIs
  // ==========================================

  getBankSetups() {
    return this.http.get<any[]>(`${this.baseUrl}/bank-setups`);
  }

  getBankSetupById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/bank-setups/${id}`);
  }

  createBankSetup(data: any) {
    return this.http.post(`${this.baseUrl}/bank-setups`, data);
  }

  updateBankSetup(id: number, data: any) {
    return this.http.put(`${this.baseUrl}/bank-setups/${id}`, data);
  }

  deleteBankSetup(id: number) {
    return this.http.delete(`${this.baseUrl}/bank-setups/${id}`);
  }

  getNextBankSetupCode() {
    return this.http.get(`${this.baseUrl}/bank-setups/next-code`, {
      responseType: 'text'
    });
  }

  // ==============================================
  // CARD SETUP
  // ==============================================

  private cardSetupUrl = `${this.baseUrl}/card-setups`;

  getCardSetups() {
    return this.get<any[]>(this.cardSetupUrl);
  }

  getCardSetupById(id: number) {
    return this.get<any>(`${this.cardSetupUrl}/${id}`);
  }

  getNextCardSetupCode() {
    return this.http.get(
      `${this.cardSetupUrl}/next-code`,
      { responseType: 'text' }
    );
  }

  createCardSetup(payload: any) {
    return this.post<any>(this.cardSetupUrl, payload);
  }

  updateCardSetup(id: number, payload: any) {
    return this.put<any>(`${this.cardSetupUrl}/${id}`, payload);
  }

  deleteCardSetup(id: number) {
    return this.delete<any>(`${this.cardSetupUrl}/${id}`);
  }

  // ==============================================
  // CARD CHARGES
  // ==============================================

  private cardChargeUrl = `${this.baseUrl}/card-charges`;

  getCardCharges() {
    return this.get<any[]>(this.cardChargeUrl);
  }

  getCardChargeById(id: number) {
    return this.get<any>(`${this.cardChargeUrl}/${id}`);
  }

  createCardCharge(payload: any) {
    return this.post<any>(this.cardChargeUrl, payload);
  }

  updateCardCharge(id: number, payload: any) {
    return this.put<any>(`${this.cardChargeUrl}/${id}`, payload);
  }

  deleteCardCharge(id: number) {
    return this.delete<any>(`${this.cardChargeUrl}/${id}`);
  }

  // =====================================================
  // INVENTORY BATCH
  // =====================================================

  getBatches() {
    return this.http.get<any[]>(`${this.baseUrl}/inventory-batch`);
  }

  getBatchLedger(batchId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/inventory-batch/${batchId}/ledger`);
  }

  // =====================================================
  // ⭐ BATCH PRODUCT MOVEMENT (NEW)
  // =====================================================
  getBatchMovement(batchId: number, productId: number) {
    return this.http.get<any>(
      `${this.baseUrl}/inventory-batch/movement?batchId=${batchId}&productId=${productId}`
    );
  }
  // =====================================================
  // ⭐ PRODUCT LEDGER
  // =====================================================
  getProductLedger(productId: number, from: string, to: string) {
    return this.http.get<any>(
      `${this.baseUrl}/inventory-batch/product-ledger`,
      {
        params: {
          productId: productId.toString(),
          fromDate: from,
          toDate: to
        }
      }
    );
  }


  // =====================================================
  // ⭐ PRODUCT CATEGORY
  // =====================================================
  getProductCategories() {
    return this.http.get<any[]>(
      `${this.baseUrl}/Category`
    );
  }


  // =====================================================
  // ⭐ PRODUCT SUB CATEGORY
  // =====================================================
  getProductSubCategories(categoryId: number) {
    return this.http.get<any[]>(
      `${this.baseUrl}/SubCategory/by-category/${categoryId}`
    );
  }


  // =====================================================
  // ⭐ PRODUCTS BY SUB CATEGORY (FIXED NAME)
  // =====================================================
  getBySubCategory(subCategoryId: number) {
    return this.http.get<any[]>(
      `${this.baseUrl}/Product/by-subcategory/${subCategoryId}`
    );
  }
}
