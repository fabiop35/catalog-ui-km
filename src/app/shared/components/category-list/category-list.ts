import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Category } from '../../models/category.model';
import { CatalogService } from '../../services/catalog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButton,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.scss']
})
export class CategoryList implements OnInit {

  categories: Category[] = [];
  editing: Record<string, Category> = {};
  creating = false;
  trackById = (index: number, item: Category) => item.id!
  form = new FormGroup({
    name: new FormControl('', Validators.required)
  });

  constructor(private svc: CatalogService, private snack: MatSnackBar) { }

  ngOnInit() {
    //this.svc.listCategories().subscribe(list => this.categories = list); 
    this.load();
  }

  load() {
    this.svc.listCategories().subscribe(list => this.categories = list);
  }

  openCreate() {
    this.form.reset();
    this.creating = true;
  }

  openEdit(cat: Category) {
    this.editing[cat.id!] = { ...cat };
    this.form.patchValue({ name: cat.name });
  }

  saveCreate() {
    if (!this.form.valid) return;
    this.svc.createCategory({ name: this.form.value.name! }).subscribe({
      next: () => {
        this.snack.open('Category created ✔️', 'Close', { duration: 3000 });
        this.creating = false;
        this.load();
      }
    });
  }

  saveEdit(id: string) {
    if (!this.form.valid) return;
    this.svc.updateCategory(id, { name: this.form.value.name! }).subscribe({
      next: () => {
        this.snack.open('Category updated ✔️', 'Close', { duration: 3000 });
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