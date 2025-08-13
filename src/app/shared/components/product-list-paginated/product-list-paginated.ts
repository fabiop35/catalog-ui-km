import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { Observable, of, map, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { CatalogService } from '../../services/catalog';
import { InlineProductEdit } from '../inline-product-edit/inline-product-edit';
import { ProductWithCategoryDto } from '../../models/product-with-category.model';
import { ProductForm } from '../product-form/product-form';
import { Category } from '../../models/category.model';
import { TaxCategory } from '../../models/tax-category.model';
import { BarcodeScanner } from "../barcode-scanner/barcode-scanner";

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
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatSelectModule,
    BarcodeScanner
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

  /* search */
  idInput = '';
  searchCtrl = new FormControl('');
  singleProduct?: ProductWithCategoryDto;
  filteredProducts$!: Observable<ProductWithCategoryDto[]>;
 detailForm!: FormGroup;

  /* dropdowns */
  categories: Category[] = [];
  taxCategories: TaxCategory[] = [];

  constructor(
    private svc: CatalogService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.load();
    this.filteredProducts$ = this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.svc.searchProducts(term || ''))
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

  onSelect(product: ProductWithCategoryDto) {
    // fetch lists once if not loaded
    this.svc.listCategories().subscribe(c => this.categories = c);
    this.svc.listTaxCategories().subscribe(tc => this.taxCategories = tc);

    this.singleProduct = product;
    this.detailForm = new FormGroup({
      name: new FormControl(product.name, Validators.required),
      display: new FormControl(product.display),
      pricesell: new FormControl(product.pricesell, Validators.required),
      pricebuy: new FormControl(product.pricebuy, Validators.required),
      categoryId: new FormControl(product.categoryId, Validators.required),
      taxcatId: new FormControl(product.taxcatId, Validators.required)
    });
     this.searchCtrl.setValue('');
  }

  clearSelection() {
    this.singleProduct = undefined;
    this.searchCtrl.setValue(''); // Clear the search box
  }

  getSingle() {
    if (!this.idInput) return;
    this.svc.getProduct(this.idInput).subscribe(p => this.singleProduct = p);
  }

  openCreateDialog() {
    this.dialog.open(ProductForm, {
      width: '500px',
      data: {} // empty DTO for create
    }).afterClosed().subscribe(result => {
      if (result) {
        this.load();                 // reload list
        this.updatedId = result.id;  // highlight
        setTimeout(() => (this.updatedId = undefined), 3000);
      }
    });
  }

  saveDetail() {
    if (!this.detailForm.valid) return;

    const payload: ProductWithCategoryDto = {
      ...this.singleProduct!, // keep read-only fields
      ...this.detailForm.getRawValue(),
      currency: 'COP'
    };

    this.svc.updateProduct(payload.id!, payload).subscribe({
      next: (p) => {
        this.snack.open('Updated ✔️', 'Close', { duration: 3000 });
        this.singleProduct = undefined;
        this.editing = {};
        this.load(); // reload page
        this.updatedId = p.id;
        setTimeout(() => (this.updatedId = undefined), 3000);
      }
    });
  }


}