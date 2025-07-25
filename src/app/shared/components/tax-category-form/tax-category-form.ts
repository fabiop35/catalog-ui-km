import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CatalogService } from '../../services/catalog';
import { TaxCategory } from '../../models/tax-category.model';
import { MatInputModule } from '@angular/material/input';
import { MatToolbar } from "@angular/material/toolbar";

@Component({
  selector: 'app-tax-category-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatToolbar],
  templateUrl: './tax-category-form.html',
  styleUrls: ['./tax-category-form.scss']
})
export class TaxCategoryForm {
  form = new FormGroup({ name: new FormControl('') });
  constructor(private svc: CatalogService, private snack: MatSnackBar) { }
  onSubmit() {
    if (!this.form.value.name) return;
    this.svc.createTaxCategory({ name: this.form.value.name }).subscribe(() => {
      this.snack.open('Tax Category created', 'Close', { duration: 3000 });
      this.form.reset();
    });
  }
}