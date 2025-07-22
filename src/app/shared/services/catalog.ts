import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { TaxCategory } from '../models/tax-category.model';
import { Tax } from '../models/tax.model';
import { ProductWithCategoryDto } from '../models/product-with-category.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly base = 'http://localhost:8081/api/v1';

  constructor(private http: HttpClient) { }

  /* Products */
  listProducts() {
    return this.http.get<Product[]>(`${this.base}/products`);
  }

  getProduct(id: string) {
    //return this.http.get<Product>(`${this.base}/products/${id}`);
    return this.http.get<ProductWithCategoryDto>(`${this.base}/products/${id}`);
  }

  createProduct(p: Product) {
    return this.http.post<Product>(`${this.base}/products`, p);
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
}