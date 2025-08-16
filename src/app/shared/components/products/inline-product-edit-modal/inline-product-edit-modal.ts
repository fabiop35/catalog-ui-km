import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';


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



@Component({
  selector: 'app-inline-product-edit-modal',
  templateUrl: './inline-product-edit-modal.html',
  styleUrls: ['./inline-product-edit-modal.scss'],
  imports: [MatIconModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule]
})
export class InlineProductEditModal implements AfterViewInit {
  form!: FormGroup;
  categories: Category[] = [];
  taxCategories: TaxCategory[] = [];

  constructor(
    public dialogRef: MatDialogRef<InlineProductEditModal>,
    @Inject(MAT_DIALOG_DATA) public data: { product: ProductWithCategoryDto },
    private service: CatalogService,
    private snack: MatSnackBar
  ) {
    this.initializeForm();
    this.loadDropdownData();
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
      taxcatId: new FormControl(this.data.product.taxcatId, Validators.required)
    });
  }

  private loadDropdownData(): void {
    this.service.listCategories().subscribe(c => this.categories = c);
    this.service.listTaxCategories().subscribe(tc => this.taxCategories = tc);
  }

  save(): void {
    if (!this.form.valid) return;

    const payload = {
      ...this.form.getRawValue(),
      currency: 'COP',
      id: this.data.product.id
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
}