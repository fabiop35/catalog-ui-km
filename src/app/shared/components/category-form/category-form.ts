import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { CatalogService } from '../../services/catalog';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule
  ],
  templateUrl: './category-form.html',
  styleUrls: ['./category-form.scss']
})
export class CategoryForm {
  form = new FormGroup({ name: new FormControl('') });

  constructor(private svc: CatalogService, private snack: MatSnackBar) { }

  onSubmit() {
    if (!this.form.value.name) return;
    this.svc.createCategory({ name: this.form.value.name }).subscribe(() => {
      this.snack.open('Category created', 'Close', { duration: 3000 });
      this.form.reset();
    });
  }
}