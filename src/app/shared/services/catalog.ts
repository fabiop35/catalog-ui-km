import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Category } from '../models/category.model';
import { Page } from '../models/page.model';
import { Product } from '../models/product.model';
import { ProductWithCategoryDto } from '../models/product-with-category.model';
import { Tax } from '../models/tax.model';
import { TaxCategory } from '../models/tax-category.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  
  private readonly base = 'http://192.168.10.3:8081/api/v1';

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

  /* Tax-Categories */
  listTaxCategories() {
    return this.http.get<TaxCategory[]>(`${this.base}/tax-categories`);
  }

  createTaxCategory(tc: TaxCategory) {
    return this.http.post<TaxCategory>(`${this.base}/tax-categories`, tc);
  }

  /* Taxes */
  listTaxes() {
    return this.http.get<Tax[]>(`${this.base}/taxes`);
  }

  createTax(t: Tax) {
    return this.http.post<Tax>(`${this.base}/taxes`, t);
  }

  updateProduct(id: string, product: ProductWithCategoryDto): Observable<ProductWithCategoryDto> {
    return this.http.put<ProductWithCategoryDto>(`${this.base}/products/${id}`, product);
  }

  listProductsPaged(page = 0, size = 5): Observable<Page<ProductWithCategoryDto>> {
    return this.http.get<Page<ProductWithCategoryDto>>(`${this.base}/products`, {
      params: { page, size }
    });
  }

  searchProducts(name: string): Observable<ProductWithCategoryDto[]> {
    return this.http.get<ProductWithCategoryDto[]>(`${this.base}/products/search`, {
      params: { name }
    });
  }
}