import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbar } from "@angular/material/toolbar";

import { CatalogService } from '../../services/catalog';
import { ProductWithCategoryDto } from '../../models/product-with-category.model';

@Component({
  selector: 'app-product-form-edit',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatToolbar],
  templateUrl: './product-form-edit.html',
  styleUrls: ['./product-form-edit.scss']
})
export class ProductFormEdit {
  @Input() product?: ProductWithCategoryDto;  // undefined for create

  form = new FormGroup({
    reference: new FormControl({ value: '', disabled: true }, Validators.required),
    code: new FormControl({ value: '', disabled: true }, Validators.required),
    codetype: new FormControl('EAN-13', Validators.required),
    name: new FormControl('', Validators.required),
    display: new FormControl(''),
    pricesell: new FormControl(0, [Validators.required, Validators.min(0)]),
    pricebuy: new FormControl(0, [Validators.required, Validators.min(0)]),
    categoryId: new FormControl('', Validators.required),
    taxcatId: new FormControl('', Validators.required)
  });

  constructor(private svc: CatalogService, private snack: MatSnackBar) { }

  ngOnChanges() {
    if (this.product) {
      this.form.patchValue({
        reference: this.product.reference,
        code: this.product.code,
        codetype: this.product.codetype,
        name: this.product.name,
        display: this.product.display,
        pricesell: this.product.pricesell,
        pricebuy: this.product.pricebuy,
        categoryId: this.product.categoryId,
        taxcatId: this.product.taxcatId
      });
    }
  }

  onSubmit() {
    if (!this.form.valid) return;
    const payload = { ...this.form.getRawValue(), currency: 'USD' } as ProductWithCategoryDto;

    const id = this.product ? this.product.id : undefined;
    const obs = id
      ? this.svc.updateProduct(id, payload)
      : this.svc.createProduct(payload);

    obs.subscribe({
      next: () => {
        this.snack.open('Saved successfully', 'Close', { duration: 3000 });
        this.form.reset();
      },
      error: () => this.snack.open('Error saving', 'Close', { duration: 3000 })
    });
  }
}