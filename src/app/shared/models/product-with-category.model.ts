export interface ProductWithCategoryDto {
  id?: string;
  reference: string;
  code: string;
  codetype: string;
  name: string;
  pricesell: number;   // ← matches backend
  pricebuy: number;    // ← matches backend
  currency: string;    // add if you use it
  categoryId: string;
  categoryName?: string;
  taxcatId: string;
  //display?: string;    // optional
}