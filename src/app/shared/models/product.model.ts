export interface Product {
  id?: string;
  reference: string;
  code: string;
  name: string;
  priceSell: number;
  priceBuy: number;
  currency: string;
  categoryId: string;
  taxCategoryId: string;
  categoryName?: string;
}