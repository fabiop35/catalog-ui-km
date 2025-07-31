import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';


import { CatalogService } from '../../services/catalog';
import { ProductWithCategoryDto } from '../../models/product-with-category.model';
import { Dialog } from '../dialog/dialog';
import { Category } from '../../models/category.model';
import { TaxCategory } from '../../models/tax-category.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatToolbarModule
  ],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.scss']
})
export class ProductForm implements OnInit {

  categories: Category[] = [];
  taxCategories: TaxCategory[] = [];
  @Input() product?: ProductWithCategoryDto;
  @Output() saved = new EventEmitter<ProductWithCategoryDto>();

  /* ---------- FORM ---------- */
  form = new FormGroup({
    reference: new FormControl(''),
    code: new FormControl(''),
    codetype: new FormControl('EAN-13'),
    name: new FormControl(''),
    display: new FormControl(''),
    pricesell: new FormControl(0),
    pricebuy: new FormControl(0),
    categoryId: new FormControl(''),
    taxcatId: new FormControl('')
  });

  constructor(
    private svc: CatalogService,
    private snack: MatSnackBar, 
    private dialog: MatDialog,
    private dialogRef?: MatDialogRef<ProductForm>,
    @Inject(MAT_DIALOG_DATA) public data?: ProductWithCategoryDto
   
  ) { }

  ngOnInit() {
    this.svc.listCategories().subscribe(list => {
    this.categories = list;
    // pre-select first category
    if (!this.product) this.form.patchValue({ categoryId: list[0]?.id });
  });

  this.svc.listTaxCategories().subscribe(list => {
    this.taxCategories = list;
    if (!this.product) this.form.patchValue({ taxcatId: list[0]?.id });
  });

  }

  onSubmit() {
    if (!this.form.valid) return;

    const payload: ProductWithCategoryDto = {
    //id: this.product?.id ?? crypto.randomUUID(), // new UUID for POST
    reference: this.form.value.reference!,
    code: this.form.value.code!,
    codetype: this.form.value.codetype!,
    name: this.form.value.name!,
    pricesell: this.form.value.pricesell!,
    pricebuy: this.form.value.pricebuy!,
    currency: 'USD',
    categoryId: this.form.value.categoryId!,
    taxcatId: this.form.value.taxcatId!,
    display: this.form.value.display || ''
  };

    const obs = this.product?.id
      ? this.svc.updateProduct(this.product.id, payload)
      : this.svc.createProduct(payload);

    obs.subscribe({
      next: (p) => {
        this.snack.open(
          this.product ? 'Product updated ✔️' : 'Product created ✔️',
          'Close',
          { duration: 3000 }
        );
        this.saved.emit(p);          // parent receives the saved product
        this.form.reset();
        this.dialogRef?.close(p);    // close dialog if opened
      },
      error: () =>
        this.snack.open('Error saving', 'Close', { duration: 3000 })
    });
  }
 
  onCancel() {
     this.form.reset();
     this.dialogRef?.close();                // if inside dialog
     this.saved.emit();                      // or signal parent
  }

}

