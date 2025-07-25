import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';


import { CatalogService } from '../../services/catalog';
import { ProductWithCategoryDto } from '../../models/product-with-category.model';
import { Dialog } from '../dialog/dialog';

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

  constructor(private svc: CatalogService, private snackBar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit() {}

  onSubmit() {
    if (this.form.valid) {
      const product: ProductWithCategoryDto = {
        reference: this.form.value.reference || '',
        code: this.form.value.code || '',
        codetype: this.form.value.codetype || 'EAN-13',
        name: this.form.value.name || '',
        display: this.form.value.display || '',
        pricesell: this.form.value.pricesell || 0,
        pricebuy: this.form.value.pricebuy || 0,
        currency: 'USD', // Default currency
        categoryId: this.form.value.categoryId || '',
        taxcatId: this.form.value.taxcatId || ''
      };

      this.svc.createProduct(product).subscribe({
        next: () => {
          this.dialog.open(Dialog, {
            data: { message: 'Product created successfully!' }
          });
          this.form.reset(); // Reset the form
        },
        error: (err) => {
          this.dialog.open(Dialog, {
            data: { message: 'Failed to create product. Please try again.' }
          });
          console.error(err);
        }
      });
    }
  }

}