import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../services/catalog';
import { ProductWithCategoryDto } from '../../models/product-with-category.model';
import { MatIconModule } from '@angular/material/icon';
import { ProductGrid } from "../product-grid/product-grid";

@Component({
  selector: 'app-product-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    FormsModule,
    MatIconModule,
    ProductGrid
],
  templateUrl: './product-panel.html',
  styleUrls: ['./product-panel.scss']
})
export class ProductPanel {
  products: any[] = [];
  singleProduct?: ProductWithCategoryDto;
  idInput = '';

  constructor(private svc: CatalogService) { this.load(); }

  load() { 
    this.svc.listProducts().subscribe(p => this.products = p); 
  }
  
  create() {
    this.svc.createProduct({
      reference: 'LIVE-DEMO',
      code: '1234567890128',
      name: 'Live Demo Product',
      priceSell: 5.99,
      priceBuy: 4.50,
      currency: 'USD',
      categoryId: 'c4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9',
      taxCategoryId: '04928060-63b7-4a0d-9b0d-b8d2d2c3e1e2'
    }).subscribe(() => this.load());
  }
  
  getSingle() {
    if (!this.idInput) return;
    this.svc.getProduct(this.idInput).subscribe(p => this.singleProduct = p);
  }
}