export interface ProductWithCategoryDto {
  id: string;
  reference: string;
  code: string;
  name: string;
  priceSell: number;
  priceBuy: number;
  currency: string;
  categoryId: string;
  categoryName: string;
  taxCategoryId: string;
}
