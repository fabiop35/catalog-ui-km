import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RouterOutlet } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { CatalogService } from './shared/services/catalog';
import { InventoryValuationReport } from './shared/components/stock/inventory-valuation-report/inventory-valuation-report';
import { LocationSelectorComponent } from './shared/components/stock/location-selector/location-selector';
import { ProductWithCategoryDto } from './shared/models/product-with-category.model';
import { ProductForm } from './shared/components/product-form/product-form';
import { StockAdjustmentModal } from './shared/components/stock/stock-adjustment-modal/stock-adjustment-modal';
import { StockCurrentList } from './shared/components/stock/stock-current-list/stock-current-list';

import { StockMovementList } from './shared/components/stock/stock-movement-list/stock-movement-list';
import { TaxCategoryPanel } from './shared/components/tax-category-panel/tax-category-panel';
import { Toolbar } from './shared/components/toolbar/toolbar';

// --- Import locale and register ---
import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';
registerLocaleData(localeEsCO);

// --- IMPORTS FOR DATE FORMATTING ---
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MAT_DATE_FORMATS, DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { NgModule } from '@angular/core'; // Required for providing DateAdapter and MAT_DATE_FORMATS

// Define the custom date format
export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'dd/MM/yyyy HH:mm', // Format for parsing user input
  },
  display: {
    dateInput: 'dd/MM/yyyy HH:mm', // Format for displaying the date in the input field
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

// Optional: Create a custom DateAdapter to ensure parsing works correctly
export class CustomDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if (typeof value === 'string' && value) {
      // Try parsing dd/MM/yyyy HH:mm
      const parts = value.split('/');
      if (parts.length === 3) {
        const timePart = parts[2].split(' ');
        if (timePart.length === 2) {
          const datePart = parts[0];
          const monthPart = parts[1];
          const yearPart = timePart[0];
          const time = timePart[1];

          if (!isNaN(parseInt(yearPart, 10)) && !isNaN(parseInt(datePart, 10)) && !isNaN(parseInt(monthPart, 10))) {
             const timeSplit = time.split(':');
             if (timeSplit.length === 2) {
                 const hours = parseInt(timeSplit[0], 10);
                 const minutes = parseInt(timeSplit[1], 10);
                 // Note: Month is 0-indexed in JavaScript Date
                 return new Date(parseInt(yearPart, 10), parseInt(monthPart, 10) - 1, parseInt(datePart, 10), hours, minutes);
             }
          }
        }
      }
    }
    return super.parse(value); // Fallback to default parsing
  }

  override format(date: Date, displayFormat: string): string {
    if (displayFormat === 'dd/MM/yyyy HH:mm') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    return super.format(date, displayFormat);
  }
}


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
    QRCodeComponent,
    // Inventory components
    StockCurrentList,
    StockMovementList,
    InventoryValuationReport,
    LocationSelectorComponent,
    StockAdjustmentModal,
    
    // --- ADDED IMPORTS FOR DATEPICKER ---
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule 
  ],
  // --- ADDED providers ARRAY ---
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter }, // Provide the custom adapter
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS } // Provide the custom formats
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