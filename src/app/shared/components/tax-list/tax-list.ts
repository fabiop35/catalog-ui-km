import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaxCategory } from '../../models/tax-category.model';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { CatalogService } from '../../services/catalog';
import { Tax } from '../../models/tax.model';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-tax-list',
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
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,   // ← required for <mat-option>
    MatChipsModule
  ],
  templateUrl: './tax-list.html',
  styleUrls: ['./tax-list.scss']
})
export class TaxList implements OnInit {

  @Input() tax?: Tax;

  taxes: Tax[] = [];
  creating = false;
  editing: Record<string, boolean> = {};
  updatedId?: string;
  trackById = (index: number, item: Tax) => item.id!
  taxCategories: TaxCategory[] = [];

  forms: Record<string, FormGroup> = {};

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    taxcatId: new FormControl('', Validators.required),
    rate: new FormControl(0, [Validators.required, Validators.min(0)])
  });

  constructor(private svc: CatalogService, private snack: MatSnackBar) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc.listTaxes().subscribe(list => this.taxes = list);
    this.svc.listTaxCategories().subscribe(tc => this.taxCategories = tc);
  }

  openCreate() {
    this.form.reset();
    this.creating = true;
  }

  openEdit(t: Tax) {
    this.editing[t.id!] = true;
    this.forms[t.id!] = new FormGroup({
      name: new FormControl(t.name, Validators.required),
      rate: new FormControl(t.rate, [Validators.required, Validators.min(0)]),
      taxcatId: new FormControl(t.taxcatId, Validators.required)
    });

  }

  saveCreate() {
    if (!this.form.valid) return;
    const payload: Tax = {
      name: this.form.value.name!,
      taxcatId: this.form.value.taxcatId!,
      rate: this.form.value.rate!
    };
    this.updatedId = payload.id;
    this.svc.createTax(payload).subscribe({
      next: () => {
        this.snack.open('Tax created ✔️', 'Close', { duration: 3000 });
        this.creating = false;
        this.load();
      }
    });
  }

  saveEdit(id: string) {
    if (!this.forms[id]?.valid) return;
    const body = {
      name: this.forms[id]!.value.name!,
      rate: this.forms[id]!.value.rate!,
      taxcatId: this.forms[id]!.value.taxcatId!
    };
    console.log(body);
    this.svc.updateTax(id, body).subscribe({
      next: () => {
        this.snack.open('Updated ✔️', 'Close', { duration: 3000 });
        this.forms[id] = null!;
        this.load();
      }
    });
  }

  cancel() {
    this.creating = false;
    this.editing = {};
  }

}