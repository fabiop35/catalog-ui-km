import { ChangeDetectorRef, Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable, of, map, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CatalogService } from '../../services/catalog';
import { InlineProductEdit } from '../inline-product-edit/inline-product-edit';
import { ProductWithCategoryDto } from '../../models/product-with-category.model';
import { ProductForm } from '../product-form/product-form';
import { Category } from '../../models/category.model';
import { TaxCategory } from '../../models/tax-category.model';
import { BarcodeScanner } from "../barcode-scanner/barcode-scanner";
import { InlineProductEditModal } from '../products/inline-product-edit-modal/inline-product-edit-modal';
import { ProductDetailModal } from '../products/product-detail-modal/product-detail-modal';



@Component({
  selector: 'app-product-list-paginated',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
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
    BarcodeScanner,
    InlineProductEditModal,
    MatTooltipModule,
    ProductDetailModal
  ],
  templateUrl: './product-list-paginated.html',
  styleUrls: ['./product-list-paginated.scss']
})
export class ProductListPaginated implements OnInit, OnDestroy {

  page = 0;
  pageSize = 10;
  products: ProductWithCategoryDto[] = [];
  hasMore = true;
  loading = false;
  creating = false;

  updatedId?: string;
  trackById = (index: number, item: ProductWithCategoryDto) => item.id!;
  editing: Record<string, boolean> = {};

  // Search
  idInput = '';
  searchCtrl = new FormControl('');
  searchResults: ProductWithCategoryDto[] | null = null; // ← Holds search results
  singleProduct?: ProductWithCategoryDto;
  filteredProducts$!: Observable<ProductWithCategoryDto[]>;
  detailForm!: FormGroup;

  // Dropdowns
  categories: Category[] = [];
  taxCategories: TaxCategory[] = [];

  private scrollSubscription: any;
  highlightedProductId: string | null = null;
  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(
    private svc: CatalogService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private scroll: ScrollDispatcher
  ) { }

  ngOnInit() {
    // ✅ Initialize search
    this.filteredProducts$ = this.searchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term) {
          this.searchResults = null;
          return of([]);
        }
        return this.svc.searchProducts(term).pipe(
          map(products => {
            this.searchResults = products;
            return products;
          })
        );
      })
    );

    // ✅ Load first page of products immediately
    this.load();

    // ✅ Keep scroll logic for "infinite scroll"
    this.scrollSubscription = this.scroll.scrolled().subscribe(() => {
      if (this.loading || !this.hasMore || this.searchResults) return;

      const el = document.documentElement;
      const offset = el.scrollHeight - el.scrollTop - el.clientHeight;

      if (offset <= 300) {
        this.load();
      }
    });
  }
  ngOnDestroy() {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  load() {
    if (this.loading || !this.hasMore) return;

    this.loading = true;
    this.svc.listProductsPaged(this.page, this.pageSize).subscribe({
      next: (page) => {
        // Append new products
        this.products = [...this.products, ...page.content];
        this.hasMore = page.number < page.totalPages - 1;
        this.page++;

        // ✅ Critical: Force Angular to detect changes
        this.cdr.detectChanges();

        // ✅ Force browser layout reflow
        this.forceReflow();

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.snack.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Forces the browser to recalculate layout
  private forceReflow() {
    // Trigger layout recalculation
    document.body.style.display = 'none';
    document.body.style.display = 'block';
  }
  resetAndReload() {
    this.page = 0;
    this.products = [];
    this.hasMore = true;
    this.load();
  }

  openEdit(product: ProductWithCategoryDto) {
    const dialogRef = this.dialog.open(InlineProductEditModal, {
      width: '100vw',
      height: '100dvh',
      maxWidth: '100vw',
      maxHeight: '100dvh',
      panelClass: 'full-screen-dialog',
      data: { product: product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onProductUpdated(result);
      }
    });
  }

  onProductUpdated(updatedProduct: ProductWithCategoryDto) {
    this.snack.open('Producto actualizado ✔️', 'Cerrar', { duration: 3000 });
    const index = this.products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      this.products[index] = updatedProduct;
    }
    this.updatedId = updatedProduct.id;
    setTimeout(() => (this.updatedId = undefined), 3000);
  }

  onSelect(product: ProductWithCategoryDto) {
    this.searchCtrl.setValue(product.name);
    this.searchResults = [product];
    this.highlightedProductId = product.id ?? null;

    if (this.categories.length === 0) {
      this.svc.listCategories().subscribe(c => this.categories = c);
    }
    if (this.taxCategories.length === 0) {
      this.svc.listTaxCategories().subscribe(tc => this.taxCategories = tc);
    }
  }

  clearSelection() {
    this.searchCtrl.setValue('');
    this.searchResults = null;
    this.cdr.detectChanges();
  }

  openCreateDialog() {
    this.dialog.open(ProductForm, {
      width: '500px',
      data: {}
    }).afterClosed().subscribe(result => {
      if (result) {
        this.resetAndReload();
        this.updatedId = result.id;
        setTimeout(() => (this.updatedId = undefined), 3000);
      }
    });
  }

  saveDetail() {
    if (!this.detailForm.valid) return;

    const payload: ProductWithCategoryDto = {
      ...this.singleProduct!,
      ...this.detailForm.getRawValue(),
      currency: 'COP'
    };

    this.svc.updateProduct(payload.id!, payload).subscribe({
      next: (p) => {
        this.snack.open('Actualizado ✔️', 'Cerrar', { duration: 3000 });
        this.singleProduct = undefined;
        this.resetAndReload();
        this.updatedId = p.id;
        setTimeout(() => (this.updatedId = undefined), 3000);
      }
    });
  }

  openBarcodeScanner() {
    const dialogRef = this.dialog.open(BarcodeScanner, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      autoFocus: false
    });

    dialogRef.componentInstance.codeScanned.subscribe(code => {
      this.handleScannedCode(code);
      dialogRef.close();
    });
  }

  handleScannedCode(code: string) {
    this.searchCtrl.setValue(code); // Triggers search via filteredProducts$

    this.svc.searchProductsByCode(code).subscribe({
      next: (products) => {
        if (products.length > 0) {
          this.searchResults = products;
          this.snack.open(`✅ Encontrado: ${products[0].name}`, 'OK', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        } else {
          this.searchResults = [];
          this.snack.open('❌ Código no encontrado', 'OK', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error buscando producto:', err);
        this.snack.open('❌ Error al buscar producto', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

  navigateToProducts() {
    this.creating = false;
    this.editing = {};
    //this.detailForm.reset();
    this.load();
  }

  totalPriceSell(product1: ProductWithCategoryDto): number {
    const taxRate = product1.taxRate ?? 0;
    return product1.pricesell * (1 + taxRate);
  }

  getRawProfit(product: ProductWithCategoryDto): number {
    const profit = product.pricesell - product.pricebuy;
    return (profit / product.pricesell);
  }

  // Calculate margin as fraction
  getMargin(product: ProductWithCategoryDto): number {
    const profit = product.pricesell - product.pricebuy;
    return (profit / product.pricebuy);
  }

  clearSearch() {
    this.searchCtrl.setValue('');
    this.searchResults = null;
    this.highlightedProductId = null;

    //Refocus input
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 0);

    this.cdr.detectChanges();
  }

  getMarginClass(margin: number): string {
    if (margin >= 0.5) return 'high-margin';
    if (margin >= 0.2) return 'medium-margin';
    return 'low-margin';
  }

  getMarkupClass(margin: number): string {
    if (margin >= 0.5) return 'high-margin';
    if (margin >= 0.2) return 'medium-margin';
    return 'low-margin';
  }


  // Return trend icon
  getTrendIcon(margin: number): string {
    if (margin >= 0.5) return 'trending_up';   // High margin → good
    if (margin >= 0.2) return 'trending_flat'; // Medium → neutral
    return 'trending_down';                    // Low → warning
  }

  // Tooltip with calculation
  getMarginTooltip(product: ProductWithCategoryDto): string {
    const sell = product.pricesell;
    const buy = product.pricebuy;
    const margin = this.getMargin(product);
    return `Margen = ((${sell} - ${buy}) / ${sell}) × 100 = ${Math.round(margin * 100)}%`;
  }

  openDetail(product: ProductWithCategoryDto) {
    this.dialog.open(ProductDetailModal, {
      width: '500px',
      maxHeight: '90vh',
      data: { product },
      panelClass: 'detail-dialog'
    });
  }

} 