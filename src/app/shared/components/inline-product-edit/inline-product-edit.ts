import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductWithCategoryDto } from '../../models/product-with-category.model';
import { MatCardModule, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CatalogService } from '../../services/catalog';
import { Category } from '../../models/category.model';
import { TaxCategory } from '../../models/tax-category.model';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inline-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatOptionModule
  ],
  templateUrl: './inline-product-edit.html',
  styleUrls: ['./inline-product-edit.scss']
})
export class InlineProductEdit implements OnInit {

  categories: Category[] = [];
  taxCategories: TaxCategory[] = [];

  @Input() product!: ProductWithCategoryDto;
  //@Output() saved = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ProductWithCategoryDto>();

  constructor(private service: CatalogService, private snack: MatSnackBar) { }

  ngOnInit() {
    this.service.listCategories().subscribe(c => this.categories = c);
    this.service.listTaxCategories().subscribe(tc => this.taxCategories = tc);
  }

  form = new FormGroup({
    reference: new FormControl({ value: '', disabled: true }, Validators.required),
    code: new FormControl({ value: '', disabled: true }, Validators.required),
    codetype: new FormControl('EAN-13'),
    name: new FormControl('', Validators.required),
    display: new FormControl(''),
    pricesell: new FormControl(0, [Validators.required, Validators.min(0)]),
    pricebuy: new FormControl(0, [Validators.required, Validators.min(0)]),
    categoryId: new FormControl('', Validators.required),
    taxcatId: new FormControl('', Validators.required)
  });

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

  save() {
    if (!this.form.valid) return;
    const payload = { ...this.form.getRawValue(), currency: 'COP' } as ProductWithCategoryDto;
    console.log('Final payload:', payload);

    this.service.updateProduct(this.product!.id!, payload).subscribe({
      next: (updated) => {
        console.log('✅ updated', updated);

        this.snack.open('Product updated ✔️', 'Close', { duration: 3000 });
        this.saved.emit(updated);      // send the new product back
        
      },
      //error: (err) => console.error(err)
      error: () => this.snack.open('Update failed', 'Close', { duration: 3000 })
    });

    //this.saved.emit();
  }

  cancel() {
    this.saved.emit();
  }
}