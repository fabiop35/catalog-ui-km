export interface StockCurrentDto {
    locationId: string;
    locationName: string;
    productId: string;
    productReference: string;
    productCode: string;
    productName: string;
    units: number;
    attributeSetInstanceId?: string;
    attributeSetInstanceDescription?: string;
    pricebuy: number;
    idSupplier?: string;
}