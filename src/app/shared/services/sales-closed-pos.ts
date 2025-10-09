// File: src/app/services/sales-closed-pos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalesClosedPosReportItem } from '../models/sales-closed-pos-report-item.model';

@Injectable({
  providedIn: 'root'
})
export class SalesClosedPos {

  private baseUrl = 'https://192.168.10.5:8443/api/v1/sales/sales-closed-pos'; // Adjust to your backend URL

  constructor(private http: HttpClient) { }

  getReportData(startDate?: string, endDate?: string): Observable<SalesClosedPosReportItem[]> {
    let params = new HttpParams();
    if (startDate) {
      // startDate and endDate are now in 'dd/MM/yyyy HH:mm' format
      // HttpClient will URL encode them (e.g., '01/09/2025 00:00' -> '01%2F09%2F2025%2000%3A00')
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<SalesClosedPosReportItem[]>(this.baseUrl, { params });
  }

  getReportAsPdf(startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get(`${this.baseUrl}/pdf`, { params, responseType: 'blob' });
  }
}