export interface CreateStockEntryRequest {
    dateNew: string; // ISO string
    reason: number;
    location: string;
    product: string;
    attributeSetInstanceId: string | null;
    units: number;
    price: number;
    appUser: string;
    supplier: string | null;
    supplierDoc: string | null;
}