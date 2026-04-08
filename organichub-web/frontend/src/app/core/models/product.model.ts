export interface Product {
  id: number;

  productName: string;
  categoryName: string;
  subCategoryName: string;

  description?: string;

  salePrice: number;

  primaryImageUrl: string | null;

  isActive?: boolean;
}