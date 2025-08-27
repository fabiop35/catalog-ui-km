import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from '@angular/material/form-field';

import { ProductWithCategoryDto } from '../../../models/product-with-category.model';
import { Category } from '../../../models/category.model';
import { TaxCategory } from '../../../models/tax-category.model';
import { CatalogService } from '../../../services/catalog';
import { Tax } from '../../../models/tax.model';
import { Supplier } from '../../../models/supplier.model';
import { SupplierSearchDialog } from '../../suppliers/supplier-search-dialog/supplier-search-dialog';



@Component({
  selector: 'app-inline-product-edit-modal',
  templateUrl: './inline-product-edit-modal.html',
  styleUrls: ['./inline-product-edit-modal.scss'],
  imports: [
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    SupplierSearchDialog
  ]
})
export class InlineProductEditModal implements AfterViewInit {

  form!: FormGroup;
  categories: Category[] = [];
  taxCategories: TaxCategory[] = [];

  rrp: number = 0;
  markup: number = 0;
  margin: number = 0;

  // Supplier
  selectedSupplier: Supplier | null = null;
  taxes: Tax[] = [];

  constructor(
    public dialogRef: MatDialogRef<InlineProductEditModal>,
    @Inject(MAT_DIALOG_DATA) public data: { product: ProductWithCategoryDto },
    private service: CatalogService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initializeForm();
    /*this.loadDropdownData();
    this.loadTaxes();
    this.initializeSupplier();*/
    this.loadAllData().subscribe(() => {
      this.initializeSupplier();
    });

  }

  ngAfterViewInit() {
    // 🔁 Force iOS to recalculate viewport height
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);

    // Focus first field
    const input = document.querySelector('input[formControlName="name"]') as HTMLInputElement;
    if (input) {
      setTimeout(() => input.focus(), 500);
    }

    // 🔔 Subscribe to price and tax changes
    const priceSellControl = this.form.get('pricesell');
    const priceBuyControl = this.form.get('pricebuy');
    const taxCatIdControl = this.form.get('taxcatId');

    priceSellControl?.valueChanges.subscribe(() => this.calculateMetrics());
    priceBuyControl?.valueChanges.subscribe(() => this.calculateMetrics());
    taxCatIdControl?.valueChanges.subscribe(() => this.calculateMetrics());

    // Initial calculation
    //this.calculateMetrics();

  }

  private initializeForm(): void {
    this.form = new FormGroup({
      reference: new FormControl({ value: this.data.product.reference, disabled: true }, Validators.required),
      code: new FormControl({ value: this.data.product.code, disabled: true }, Validators.required),
      codetype: new FormControl(this.data.product.codetype || 'EAN-13'),
      name: new FormControl(this.data.product.name, Validators.required),
      //display: new FormControl(this.data.product.display || ''),
      pricesell: new FormControl(this.data.product.pricesell, [Validators.required, Validators.min(0)]),
      pricebuy: new FormControl(this.data.product.pricebuy, [Validators.required, Validators.min(0)]),
      categoryId: new FormControl(this.data.product.categoryId, Validators.required),
      taxcatId: new FormControl(this.data.product.taxcatId, Validators.required),
      idSupplier: new FormControl(this.data.product.idSupplier || '')
    });
  }

  private loadDropdownData(): void {
    forkJoin({
      categories: this.service.listCategories(),
      taxCategories: this.service.listTaxCategories()
    }).subscribe(({ categories, taxCategories }) => {
      this.categories = categories;
      this.taxCategories = taxCategories;

      // Pre-fill defaults if needed
      if (!this.data.product.categoryId && categories.length > 0) {
        this.form.patchValue({ categoryId: categories[0].id });
      }
      if (!this.data.product.taxcatId && taxCategories.length > 0) {
        this.form.patchValue({ taxcatId: taxCategories[0].id });
      }

      // ✅ Now safe to calculate (form + tax data ready)
      this.calculateMetrics();
    });
  }

  save(): void {
    if (!this.form.valid) return;

    const payload = {
      ...this.form.getRawValue(),
      currency: 'COP',
      id: this.data.product.id,
      idSupplier: this.form.get('idSupplier')?.value || null
    } as ProductWithCategoryDto;

    this.service.updateProduct(this.data.product.id!, payload).subscribe({
      next: (updated) => {
        this.snack.open('Product updated ✔️', 'Close', { duration: 3000 });
        this.dialogRef.close(updated);
      },
      error: () => {
        this.snack.open('Update failed', 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private initializeSupplier(): void {
    const supplierId = this.form.get('idSupplier')?.value;
    if (supplierId) {
      this.service.getSupplierById(supplierId).subscribe({
        next: (supplier: Supplier) => {
          this.selectedSupplier = supplier;
          // No need to patch form — already set
        },
        error: () => {
          this.selectedSupplier = null;
          console.warn('Supplier not found for ID:', supplierId);
        }
      });
    } else {
      this.selectedSupplier = null;
    }
  }

  getSupplierName(): string {
    return this.selectedSupplier?.name || '';
  }

  openSupplierSearch(): void {
    const dialogRef = this.dialog.open(SupplierSearchDialog, {
      width: '90vw',
      maxWidth: '600px',
      maxHeight: '80vh',
      data: { selectedId: this.form.get('idSupplier')?.value || null }
    });

    dialogRef.afterClosed().subscribe((supplier: Supplier | undefined) => {
      if (supplier) {
        this.selectedSupplier = supplier;
        this.form.patchValue({ idSupplier: supplier.id });
      }
    });
  }

  clearSupplier(event: Event): void {
    event.stopPropagation();
    this.selectedSupplier = null;
    this.form.patchValue({ idSupplier: '' });
  }

  private loadTaxes(): void {
    this.service.listTaxes().subscribe(taxes => {
      this.taxes = taxes;
      this.calculateMetrics(); // Initial RRP depends on tax
    });
  }

  private calculateRrp() {
    const priceSell = this.form.get('pricesell')?.value || 0;
    const taxCatId = this.form.get('taxcatId')?.value;

    const tax = this.taxes.find(t => t.taxcatId === taxCatId);
    const taxRate = tax?.rate || 0;

    this.rrp = priceSell * (1 + taxRate);
  }

  private calculateMetrics() {
    const priceSell = this.form.get('pricesell')?.value || 0;
    const priceBuy = this.form.get('pricebuy')?.value || 0;

    // Markup: (sell - buy) / buy
    this.markup = priceBuy > 0 ? ((priceSell - priceBuy) / priceBuy) * 100 : 0;
    

    // Margin: (sell - buy) / sell
    this.margin = priceSell > 0 ? ((priceSell - priceBuy) / priceSell) * 100 : 0;

    this.calculateRrp();
  }

  private loadAllData() {
    return forkJoin({
      categories: this.service.listCategories(),
      taxCategories: this.service.listTaxCategories(),
      taxes: this.service.listTaxes()
    }).pipe(
      tap(({ categories, taxCategories, taxes }) => {
        this.categories = categories;
        this.taxCategories = taxCategories;
        this.taxes = taxes;

        if (!this.form.get('taxcatId')?.value && taxCategories.length > 0) {
          this.form.patchValue({ taxcatId: taxCategories[0].id });
        }

        this.calculateMetrics();
      })
    );
  }
}