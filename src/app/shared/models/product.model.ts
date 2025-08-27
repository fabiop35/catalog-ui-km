export interface Product {
  id: string;
  reference: string;
  code: string;
  codetype: string;
  name: string;
  pricesell: number;
  pricebuy: number;
  currency: string;
  categoryId: string;
  taxcatId: string;
  categoryName?: string;
  idSupplier?: string;
}