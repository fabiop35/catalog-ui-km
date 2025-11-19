import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { Category } from '../models/category.model';
import { Page } from '../models/page.model';
import { Product } from '../models/product.model';
import { ProductWithCategoryDto } from '../models/product-with-category.model';
import { Tax } from '../models/tax.model';
import { TaxCategory } from '../models/tax-category.model';
import { Supplier } from '../models/supplier.model';
import { StockDiary } from '../models/stockdiary.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {

  //private readonly base = 'http://192.168.10.3:8081/api/v1';
 // private readonly base = 'https://192.168.1.41:8443/api/v1';
  private readonly base = 'https://uniposweb:8443/api/v1';

  constructor(private http: HttpClient) { }

  /* Products */
  listProducts(): Observable<ProductWithCategoryDto[]> {
    console.log(">>> CatalogService.listProducts() <<< ")
    //return this.http.get<Product[]>(`${this.base}/products`);
    return this.http.get<ProductWithCategoryDto[]>(`${this.base}/products`);
  }

  getProduct(id: string) {
    //return this.http.get<Product>(`${this.base}/products/${id}`);
    return this.http.get<ProductWithCategoryDto>(`${this.base}/products/${id}`);
  }

  createProduct(product: ProductWithCategoryDto): Observable<ProductWithCategoryDto> {
    return this.http.post<ProductWithCategoryDto>(`${this.base}/products`, product);
  }

  /* Categories */
  listCategories() {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  createCategory(c: Category) {
    return this.http.post<Category>(`${this.base}/categories`, c);
  }

  /* update category**/
  updateCategory(id: string, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.base}/categories/${id}`, category);
  }

  /* Tax-Categories 
  listTaxCategories() {
    return this.http.get<TaxCategory[]>(`${this.base}/tax-categories`);
  }*/

  listTaxCategories(): Observable<TaxCategory[]> {
    return this.http.get<TaxCategory[]>(`${this.base}/tax-categories`);
  }

  createTaxCategory(tc: TaxCategory) {
    return this.http.post<TaxCategory>(`${this.base}/tax-categories`, tc);
  }

  updateTaxCategory(id: string, taxCategory: TaxCategory): Observable<Category> {
    return this.http.put<Category>(`${this.base}/tax-categories/${id}`, taxCategory);
  }

  /* Taxes */
  listTaxes() {
    return this.http.get<Tax[]>(`${this.base}/taxes`);
  }

  createTax(t: Tax) {
    return this.http.post<Tax>(`${this.base}/taxes`, t);
  }

  updateTax(id: string, tax: Tax): Observable<Tax> {
    return this.http.put<Tax>(`${this.base}/taxes/${id}`, tax);
  }

  updateProduct(id: string, product: ProductWithCategoryDto): Observable<ProductWithCategoryDto> {
    return this.http.put<ProductWithCategoryDto>(`${this.base}/products/${id}`, product);
  }

  listProductsPaged(page = 0, size = 5): Observable<Page<ProductWithCategoryDto>> {
    return this.http.get<Page<ProductWithCategoryDto>>(`${this.base}/products?sort=name`, {
      params: { page, size }
    });
  }

  searchProducts(name: string): Observable<ProductWithCategoryDto[]> {
    return this.http.get<ProductWithCategoryDto[]>(`${this.base}/products/search`, {
      params: { name }
    });
  }

  /* Suppliers */
  getSuppliers(page: number, size: number, order: string): Observable<Page<Supplier>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      ;
    return this.http.get<Page<Supplier>>(`${this.base}/suppliers`, { params });
  }

  getSupplierById(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.base}/suppliers/${id}`);
  }

  createSupplier(supplier: Omit<Supplier, 'id'>): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.base}/suppliers`, supplier);
  }

  updateSupplier(id: string, supplier: Omit<Supplier, 'id'>): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.base}/suppliers/${id}`, supplier);
  }

  deleteSupplier(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/suppliers/${id}`);
  }

  //Method to search for suppliers by searchkey.
  searchSuppliers(term: string): Observable<Supplier[]> {
    if (!term || !term.trim()) { //Handle null/undefined term
      return of([]); // Return an empty observable if term is empty
    }
    const params = new HttpParams().set('term', term);
    return this.http.get<Supplier[]>(`${this.base}/suppliers/search`, { params });
  }

  getStockDiary(supplierId: string) {
    return this.http.get<StockDiary[]>(`${this.base}/suppliers/${supplierId}/stockdiary`);
  }

  searchProductsByCode(code: string): Observable<ProductWithCategoryDto[]> {
    return this.http.get<ProductWithCategoryDto[]>(`${this.base}/products/searchByCode`, {
      params: { code }
    });
  }

  // Add this method to get the next reference
  getNextProductReference(): Observable<{ reference: string }> {
    return this.http.get<{ reference: string }>(`${this.base}/products/getNextProductReference`);
  }

}