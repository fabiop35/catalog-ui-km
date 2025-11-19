import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { StockHistoryDto } from '../models/stock-history-dto.model';
import { InventoryValuationDto } from '../models/inventory-item-valuation-dto.model';
import { StockCurrentDto } from '../models/stock-current.dto.model';
import { Location as LocationModel } from '../models/location.model';
import { PageDto } from '../models/page-dto.model';
import { CreateStockEntryRequest } from '../models/create-stock-entry-request.model';


export interface StockService {
  page?: number;
  size?: number;
  locationId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  reason?: number | null;
}

@Injectable({ providedIn: 'root' })
export class StockService {

  private readonly base = 'https://uniposweb:8443/api/v1';

  constructor(private http: HttpClient) { }

  // Current stock operations
  getCurrentStock(
    page: number = 0,
    size: number = 20,
    searchTerm: string = '',
    locationId: string | null = null
  ): Observable<PageDto<StockCurrentDto>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (searchTerm) params = params.set('search', searchTerm);
    if (locationId) params = params.set('locationId', locationId);

    return this.http.get<PageDto<StockCurrentDto>>(`${this.base}/stock/current`, { params });

  }
  // Stock movement history
  getStockMovements(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.http.get<any>(`${this.base}/stock/movements`, { params: httpParams });
  }

  getStockMovementById(id: string): Observable<StockHistoryDto> {
    return this.http.get<StockHistoryDto>(`${this.base}/stock/movements/${id}`);
  }

  getStockMovementsForProduct(
    locationId: string,
    productId: string,
    attributeSetInstanceId: string = ''
  ): Observable<StockHistoryDto[]> {
    return this.http.get<StockHistoryDto[]>(`${this.base}/stock/movements/product`, {
      params: {
        locationId,
        productId,
        attributeSetInstanceId
      }
    });
  }

  // Stock adjustment
  // Update the adjustStock method to send a JSON body
  adjustStock(
    locationId: string,
    productId: string,
    attributeSetInstanceId: string,
    newStock: number,
    notes: string = ''
  ): Observable<any> {
    // Get actual user ID from auth service in production
    const userId = 'current-user-id'; // Replace with actual user ID from auth service

    const payload = {
      locationId,
      productId,
      attributeSetInstanceId: attributeSetInstanceId || null,
      newStock,
      userId,
      notes: notes || null
    };

    return this.http.post(`${this.base}/stock/adjust`, payload).pipe(
      catchError(error => {
        let errorMessage = 'Error al ajustar el stock';

        if (error.status === 400) {
          const validationErrors = error.error?.errors || [];
          if (validationErrors.length > 0) {
            errorMessage = validationErrors[0].defaultMessage || errorMessage;
          }
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Inventory valuation
  getInventoryValuation(): Observable<InventoryValuationDto> {
    return this.http.get<InventoryValuationDto>(`${this.base}/stock/valuation`);
  }

  // Locations
  getLocations(): Observable<LocationModel[]> {
    return this.http.get<LocationModel[]>(`${this.base}/stock/locations`);
  }

  // This matches the Java backend endpoint: @GetMapping("/current")
  getCurrentStockByLocation(locationId: string): Observable<StockCurrentDto[]> {
    return this.http.get<StockCurrentDto[]>(`${this.base}/stock/current/location/${locationId}`);
  }

  // This matches the Java backend endpoint: @GetMapping("/history/product/{productId}")
  getStockHistoryForProduct(
    productId: string,
    startDate?: string,
    endDate?: string
  ): Observable<StockHistoryDto[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<StockHistoryDto[]>(`${this.base}/stock/history/product/${productId}`, { params });
  }

  //History
  getStockHistoryForItem(
    locationId: string,
    productId: string,
    attributeSetInstanceId: string = ''
  ): Observable<StockHistoryDto[]> {
    let params = new HttpParams()
      .set('locationId', locationId)
      .set('productId', productId);
    if (attributeSetInstanceId) {
      params = params.set('attributeSetInstanceId', attributeSetInstanceId);
    }
    return this.http.get<StockHistoryDto[]>(`${this.base}/stock/history/item`, { params });
  }

  // Get Current Stock Items by Product Code
  getCurrentStockByProductCode(code: string, locationId?: string | null): Observable<StockCurrentDto[]> {
    let params = new HttpParams().set('code', code);
    if (locationId) {
      params = params.set('locationId', locationId);
    }
    return this.http.get<StockCurrentDto[]>(`${this.base}/stock/current/byCode`, { params });
  }


  createStockEntry(entry: StockEntryRequest): Observable<any> {
    // Convert date to ISO string for backend
    const payload = {
      ...entry,
      date: entry.date.toString()
    };
    return this.http.post(`${this.base}/stock/entry`, payload);
  }

}

export interface StockEntryRequest {
  productId: string;
  attributeSetInstanceId: string | null;
  price: number;
  date: string;
  reason: number;
  locationId: string;
  supplier: string | null;
  supplierDoc: string | null;
  units: number;
  pricesell: number;
}