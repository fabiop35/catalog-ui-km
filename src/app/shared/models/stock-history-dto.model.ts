// src/app/shared/models/stock-history-dto.model.ts
export interface StockHistoryDto {
    id: string;
    date: string; // or Date if parsed
    reason: number;
    locationId: string;
    productId: string;
    attributeSetInstanceId?: string;
    units: number;
    price: number | null; // Check if price can be null in DB/Java model
    userId?: string;
    supplierId?: string;
    supplierDoc?: string;
    notes?: string;
    productName?: string;
    locationName?: string;
    userName?: string;
    supplierName?: string;
    attributeSetInstanceDescription?: string;
}