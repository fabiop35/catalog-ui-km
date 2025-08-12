export interface StockDiary {
  id: string;
  datenew: string;
  reason: number;
  location: string;
  product: string;
  productName: string;
  attributesetinstanceId: string | null;
  units: number;
  price: number;
  appuser: string;
  supplier: string;
  supplierdoc: string;
  new: boolean;
  newProduct: boolean;
}