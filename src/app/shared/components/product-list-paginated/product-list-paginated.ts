import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { Observable, of, map, startWith, debounceTime, distinctUntilChanged } from 'rxjs';

import { CatalogService } from '../../services/catalog';
import { InlineProductEdit } from '../inline-product-edit/inline-product-edit';
import { ProductWithCategoryDto } from '../../models/product-with-category.model';

@Component({
  selector: 'app-product-list-paginated',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatPaginatorModule,
    MatChipsModule,
    RouterLink,
    MatIconModule,
    InlineProductEdit,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './product-list-paginated.html',
  styleUrls: ['./product-list-paginated.scss']
})
export class ProductListPaginated implements OnInit {

  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;
  updatedId?: string;
  products: ProductWithCategoryDto[] = [];
  trackById = (index: number, item: ProductWithCategoryDto) => item.id!
  editing: Record<string, boolean> = {};

  idInput = '';
  searchCtrl = new FormControl('');
  singleProduct?: ProductWithCategoryDto;
  filteredProducts$!: Observable<ProductWithCategoryDto[]>;

  constructor(private svc: CatalogService, private snack: MatSnackBar) { }

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
    this.svc.listProductsPaged(this.pageIndex, this.pageSize).subscribe(page => {
      this.products = page.content;
      this.totalElements = page.totalElements;
    });
  }

  onPageChange(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  openEdit(product: ProductWithCategoryDto) {
    this.editing[product.id!] = true;
  }

  onProductUpdated() {
    this.snack.open('Product updated ✔️', 'Close', { duration: 3000 });
    this.editing = {};
    this.load(); // reload current page
    this.updatedId = this.products[0]?.id; // last modified (or pass id from save)
    setTimeout(() => (this.updatedId = undefined), 3000);
  }

  private _filter(value: string): ProductWithCategoryDto[] {
    const term = value.toLowerCase();
    return this.products.filter(p => p.name.toLowerCase().includes(term));
  }

  displayFn(product: ProductWithCategoryDto): string {
    return product?.name || '';
  }

  onSelect(event: MatAutocompleteSelectedEvent) {
    this.singleProduct = event.option.value;
    this.searchCtrl.setValue(''); // Clear the search box
  }

  clearSelection() {
    this.singleProduct = undefined;
    this.searchCtrl.setValue(''); // Clear the search box
  }

  getSingle() {
    if (!this.idInput) return;
    this.svc.getProduct(this.idInput).subscribe(p => this.singleProduct = p);
  }

}