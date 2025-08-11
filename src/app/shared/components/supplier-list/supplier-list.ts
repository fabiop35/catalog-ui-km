import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';

import { Supplier } from '../../models/supplier.model';
import { CatalogService } from '../../services/catalog';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatChipsModule,
    RouterLink
  ],
  templateUrl: './supplier-list.html',
  styleUrls: ['./supplier-list.scss']
})
export class SupplierList implements OnInit {

  suppliers: Supplier[] = [];
  editing: Record<string, Supplier> = {};
  creating = false;
  editId = '';          // helper to know who we are editing
  isCreate = true;      // toggles title / button text

  displayList: Supplier[] = [];
  searchCtrl = new FormControl('');

  /*  autocomplete stream */
  searchResults$ = this.searchCtrl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => this.svc.searchSuppliers(typeof term === 'string' ? term : ''))
  );

  form = new FormGroup({
    searchkey: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    maxdebt: new FormControl(0, [Validators.required, Validators.min(0)]),
    visible: new FormControl(true),

    // all nullable fields
    taxid: new FormControl<string | null>(null),
    address: new FormControl<string | null>(null),
    address2: new FormControl<string | null>(null),
    postal: new FormControl<string | null>(null),
    city: new FormControl<string | null>(null),
    region: new FormControl<string | null>(null),
    country: new FormControl<string | null>(null),
    firstname: new FormControl<string | null>(null),
    lastname: new FormControl<string | null>(null),
    email: new FormControl<string | null>(null),
    phone: new FormControl<string | null>(null),
    phone2: new FormControl<string | null>(null),
    fax: new FormControl<string | null>(null),
    notes: new FormControl<string | null>(null),
    vatid: new FormControl<string | null>(null),

    // server only – not in form
    curdate: new FormControl<string | null>(null),
    curdebt: new FormControl<number | null>(null)
  });

  isEditing = false;
  detailForm!: FormGroup;
  selectedSupplier?: Supplier;
  trackById = (index: number, item: Supplier) => item.id!;

  constructor(
    private svc: CatalogService,
    private snack: MatSnackBar
  ) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc.getSuppliers(0, 999, 'active').subscribe(res => {
      this.suppliers = res.content;
      this.displayList = this.suppliers;
    });
  }

  onSelect(supplier: Supplier) {
    this.selectedSupplier = supplier;   // ← simple assignment
  }

  clearSelection() {
    this.selectedSupplier = undefined;
    this.searchCtrl.setValue('');
  }
  clearSearch() {
    this.searchCtrl.setValue('');
    this.displayList = this.suppliers;
  }

  openCreate() {
    this.isCreate = true;
    this.form.reset({
      city: 'Bogota',
      country: 'Colombia',
      visible: true,
      maxdebt: 0
    });
    this.creating = true;
  }

  openEdit(s: Supplier) {
    this.isCreate = false;
    this.editId = s.id!;
    this.editing[s.id!] = s;
    this.form.patchValue(s);
  }

  saveCreate() {
    if (!this.form.valid) return;
    const payload: Omit<Supplier, 'id'> = this.form.value as Omit<Supplier, 'id'>;
    this.svc.createSupplier(payload).subscribe(() => {
      this.snack.open('Proveedor creado ✔️', 'Cerrar', { duration: 3000 });
      this.creating = false;
      this.load();
    });
  }

  saveEdit(id: string) {
    if (!this.form.valid) return;
    const payload: Omit<Supplier, 'id'> = this.form.value as Omit<Supplier, 'id'>;
    this.svc.updateSupplier(id, payload).subscribe(() => {
      this.snack.open('Proveedor actualizado ✔️', 'Cerrar', { duration: 3000 });
      this.editing[id] = null!;
      this.load();
    });
  }


  deleteSupplier(id: string) {
    if (!confirm('¿Eliminar este proveedor?')) return;
    this.svc.deleteSupplier(id).subscribe(() => {
      this.snack.open('Proveedor eliminado ✔️', 'Cerrar', { duration: 3000 });
      this.load();
    });
  }

  cancel() {
    this.creating = false;
    this.editing = {};
  }


  displayFn = (s: Supplier | null) => s?.searchkey ?? '';

  startEdit() {
    this.isEditing = true;
    this.buildDetailForm(this.selectedSupplier!);
  }

  cancelEdit() {
    this.isEditing = false;
    this.detailForm.reset();
  }

  saveDetail() {
    if (!this.detailForm.valid) return;

    const payload: Omit<Supplier, 'id'> = {
      ...this.selectedSupplier!,        // keep readonly fields
      ...this.detailForm.getRawValue()
    };

    this.svc.updateSupplier(this.selectedSupplier!.id, payload).subscribe(() => {
      this.snack.open('Proveedor actualizado ✔️', 'Cerrar', { duration: 3000 });
      this.isEditing = false;
      this.clearSelection();
      this.load();                // refresh grid
    });
  }

  private buildDetailForm(s: Supplier) {
    this.detailForm = new FormGroup({
      searchkey: new FormControl(s.searchkey, Validators.required),
      name: new FormControl(s.name, Validators.required),
      maxdebt: new FormControl(s.maxdebt, [Validators.required, Validators.min(0)]),
      taxid: new FormControl(s.taxid),
      email: new FormControl(s.email),
      phone: new FormControl(s.phone),
      address: new FormControl(s.address),
      address2: new FormControl(s.address2),
      postal: new FormControl(s.postal),
      city: new FormControl(s.city),
      region: new FormControl(s.region),
      country: new FormControl(s.country),
      visible: new FormControl(s.visible)
    });
  }


}