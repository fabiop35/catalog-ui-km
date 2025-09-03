export interface InventoryItemValuationDto {
  productId: string;
  productName: string;
  units: number;
  costPrice: number;
  itemValue: number;
  attributeSetInstanceId?: string;
}

export interface InventoryValuationDto {
  totalValue: number;
  items: InventoryItemValuationDto[];
}