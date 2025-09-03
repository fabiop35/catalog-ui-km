export interface StockHistoryDto {
    id: string;
    date: string;
    reason: number;
    locationId: string;
    locationName: string;
    productId: string;
    productName: string;
    productReference: string;
    productCode: string;
    attributeSetInstanceId?: string;
    attributeSetInstanceDescription?: string;
    units: number;
    price: number;
    userId: string;
    userName: string;
    supplierId?: string;
    supplierName?: string;
    supplierDoc?: string;
    notes?: string;
}