import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { CatalogService } from '../../services/catalog';
import { TaxCategory } from '../../models/tax-category.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-tax-category-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './tax-category-list.html',
  styleUrls: ['./tax-category-list.scss']
})
export class TaxCategoryList implements OnInit {

  taxCategories: TaxCategory[] = [];
  creating = false;
  editing: Record<string, TaxCategory> = {};
  form = new FormGroup({
    name: new FormControl('', Validators.required)
  });
  trackById = (index: number, item: TaxCategory) => item.id!

  constructor(private svc: CatalogService, private snack: MatSnackBar) { }

  ngOnInit() {
    //this.svc.listTaxCategories().subscribe(list => this.taxCategories = list); 
    this.load();
  }

  load() {
    this.svc.listTaxCategories().subscribe(list => this.taxCategories = list);
  }

  openCreate() {
    this.form.reset();
    this.creating = true;
  }

  openEdit(tc: TaxCategory) {
    this.editing[tc.id!] = { ...tc };
    this.form.patchValue({ name: tc.name });
  }

  saveCreate() {
    if (!this.form.valid) return;
    this.svc.createTaxCategory({ name: this.form.value.name! }).subscribe({
      next: () => {
        this.snack.open('Tax category created ✔️', 'Close', { duration: 3000 });
        this.creating = false;
        this.load();
      }
    });
  }

  saveEdit(id: string) {
    if (!this.form.valid) return;
    this.svc.updateTaxCategory(id, { name: this.form.value.name! }).subscribe({
      next: () => {
        this.snack.open('Tax category updated ✔️', 'Close', { duration: 3000 });
        this.editing[id] = null!;
        this.load();
      }
    });
  }

  cancel() {
    this.creating = false;
    this.editing = {};
  }


}