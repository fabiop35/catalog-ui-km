import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, of, map, startWith, debounceTime, distinctUntilChanged } from 'rxjs';

import { CatalogService } from '../../services/catalog';
import { ProductWithCategoryDto } from '../../models/product-with-category.model';
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
    ProductGrid,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    RouterLink
  ],
  templateUrl: './product-panel.html',
  styleUrls: ['./product-panel.scss']
})
export class ProductPanel {
  products: ProductWithCategoryDto[] = [];
  singleProduct?: ProductWithCategoryDto;
  idInput = '';
  searchCtrl = new FormControl('');
  filteredProducts$!: Observable<ProductWithCategoryDto[]>;

  constructor(private svc: CatalogService) {
    //this.load(); 
  }

  ngOnInit() {
    this.load();
    this.filteredProducts$ = this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith(''),
      map(term => this._filter(term || ''))
    );
  }

  load() {
    //this.svc.listProducts().subscribe(p => this.products = p); 
    //this.svc.listProducts().subscribe(list => this.products = list);
    this.svc.listProducts().subscribe(list => {
      this.products = list;
    });
  }

  private _filter(value: string): ProductWithCategoryDto[] {
    const term = value.toLowerCase();
    return this.products.filter(p => p.name.toLowerCase().includes(term));
  }

  onSelect(event: MatAutocompleteSelectedEvent) {
    this.singleProduct = event.option.value;
    this.searchCtrl.setValue(''); // Clear the search box
  }

  create() {
    this.svc.createProduct({
      id: '001',
      reference: 'LIVE-DEMO',
      code: '1234567890128',
      codetype: 'EAN-13',
      name: 'Live Demo Product',
      pricesell: 5.99,
      pricebuy: 4.50,
      currency: 'USD',
      categoryId: 'c4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9',
      taxcatId: '04928060-63b7-4a0d-9b0d-b8d2d2c3e1e2'
    }).subscribe(() => this.load());
  }

  getSingle() {
    if (!this.idInput) return;
    this.svc.getProduct(this.idInput).subscribe(p => this.singleProduct = p);
  }

  displayFn(product: ProductWithCategoryDto): string {
    return product?.name || '';
  }

  clearSelection() {
    this.singleProduct = undefined;
    this.searchCtrl.setValue(''); // Clear the search box
  }

}