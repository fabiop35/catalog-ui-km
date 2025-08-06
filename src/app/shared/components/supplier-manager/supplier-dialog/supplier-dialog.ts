import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';

import { Supplier } from '../../../models/supplier.model';


@Component({
  selector: 'app-supplier-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule
  ],
  templateUrl: './supplier-dialog.html',
  styleUrl: './supplier-dialog.scss'
})
export class SupplierDialog {
  form: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SupplierDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { supplier?: Supplier }
  ) {
    this.isEditMode = !!data.supplier;

    this.form = this.fb.group({
      searchkey: [data.supplier?.searchkey || '', Validators.required],
      name: [data.supplier?.name || '', Validators.required],
      taxid: [data.supplier?.taxid || ''],
      email: [data.supplier?.email || '', [Validators.email]],
      maxdebt: [data.supplier?.maxdebt || 0, [Validators.required, Validators.min(0)]],
      phone: [data.supplier?.phone || ''],
      address: [data.supplier?.address || ''],
      city: [data.supplier?.city || ''],
      country: [data.supplier?.country || ''],
      visible: [data.supplier?.visible ?? true, Validators.required],
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}