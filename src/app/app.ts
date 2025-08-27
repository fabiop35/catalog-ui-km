import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CatalogService } from './shared/services/catalog';
import { ProductWithCategoryDto } from './shared/models/product-with-category.model';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

import { TaxCategoryPanel } from './shared/components/tax-category-panel/tax-category-panel';
import { Toolbar } from './shared/components/toolbar/toolbar';
import { ProductForm } from './shared/components/product-form/product-form';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';

//type ActiveTab = 'suppliers' | 'products' | 'categories' | 'taxes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    TaxCategoryPanel,
    MatToolbarModule,
    Toolbar,
    MatSnackBarModule,
    ProductForm,
    MatDialogModule,
    FormsModule,
    QRCodeComponent
  ],
  templateUrl: './app.html'
})
export class AppComponent {
  products: any[] = [];
  categories: any[] = [];
  taxCategories: any[] = [];
  taxes: any[] = [];
  selectedProduct?: ProductWithCategoryDto;
  singleProduct?: ProductWithCategoryDto;

  constructor(private svc: CatalogService) { }

  /* ---------- PRODUCTS ---------- */
  loadProducts() {
    this.svc.listProducts().subscribe(data => this.products = data);
  }
  createDummyProduct() {
    this.svc.createProduct({
      id: "",
      reference: 'APP-TEST',
      code: '1234567890128',
      codetype: 'EAN-13',
      name: 'App-Test Product',
      pricesell: 4.99,
      pricebuy: 3.50,
      currency: 'USD',
      categoryId: 'c4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9',
      taxcatId: '04928060-63b7-4a0d-9b0d-b8d2d2c3e1e2'
    }).subscribe(() => this.loadProducts());
  }

  /* ---------- CATEGORIES ---------- */
  loadCategories() {
    this.svc.listCategories().subscribe(data => this.categories = data);
  }
  createDummyCategory() {
    this.svc.createCategory({ name: 'Demo Category' }).subscribe(() => this.loadCategories());
  }

  /* ---------- TAX-CATEGORIES ---------- */
  loadTaxCategories() {
    this.svc.listTaxCategories().subscribe(data => this.taxCategories = data);
  }
  createDummyTaxCategory() {
    this.svc.createTaxCategory({ name: 'Demo TaxCat' }).subscribe(() => this.loadTaxCategories());
  }

  /* ---------- TAXES ---------- */
  loadTaxes() {
    this.svc.listTaxes().subscribe(data => this.taxes = data);
  }
  createDummyTax() {
    this.svc.createTax({
      name: 'Demo VAT 7%',
      taxcatId: '04928060-63b7-4a0d-9b0d-b8d2d2c3e1e2',
      rate: 0.07
    }).subscribe(() => this.loadTaxes());
  }

  // method
  getSingleProduct(id: string) {
    if (!id) return;
    this.svc.getProduct(id).subscribe({
      next: p => this.singleProduct = p,
      error: () => (this.singleProduct = undefined)
    });
  }
}