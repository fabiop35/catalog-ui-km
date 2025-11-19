// stock-entry-modal.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StockService } from '../../../services/stock.service';

import { Supplier } from '../../../models/supplier.model';
//import { LocationModel } from '../../../models/location.model';
import { Location as LocationModel } from '../../../models/location.model';
import { firstValueFrom } from 'rxjs';
import { CatalogService } from '../../../services/catalog';

export interface StockEntryModalData {
  locationId: string;
  productId: string;
  productName?: string;
  attributeSetInstanceId?: string | null;
  currentPrice: number;
  pricesell: number;
  idSupplier?: string;
}

@Component({
  selector: 'app-stock-entry-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './stock-entry-modal.component.html',
  styleUrls: ['./stock-entry-modal.component.scss']
})
export class StockEntryModalComponent implements OnInit {
  form!: UntypedFormGroup;
  loading = false;
  locations: LocationModel[] = [];
  suppliers: Supplier[] = [];
  reasons = [
    { value: 1, label: '(entrada) compra' },
    { value: -1, label: '(salida) venta' },
    { value: 1000, label: 'Traspaso' },
    { value: -2, label: 'Retornar - Suprimir' },
    { value: 2, label: '(entrada) devolución' },
    { value: -3, label: '(salida) rotura' },
    { value: 4, label: '(entrada) Traspaso' },
    { value: -4, label: '(salida) Traspaso' },
    { value: -5, label: 'Cortesía, Muestra - Salida' },
    { value: -6, label: 'Gratis' },
    { value: -7, label: 'Usado' },
    { value: -8, label: 'Sustraer' }
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private stockService: StockService,
    private catalogService: CatalogService,
    public dialogRef: MatDialogRef<StockEntryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StockEntryModalData
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      price: [this.data.currentPrice || 0, [Validators.required, Validators.min(0)]],
      pricesell: [this.data.pricesell || 0],
      date: [new Date(), Validators.required],
      reason: [1, Validators.required],
      locationId: [this.data.locationId, Validators.required],
      idSupplier: [this.data.idSupplier],
      supplierDoc: [''],
      quantity: [1, [Validators.required, Validators.min(0.01)]]
    });

    this.loadLocations();
    this.loadSuppliers();
  }

  private loadLocations() {
    this.stockService.getLocations().subscribe(locations => {
      this.locations = locations;
    });
  }

  private loadSuppliers() {
    firstValueFrom(this.catalogService.getSuppliers(0, 100, 'name')).then(page => {
      this.suppliers = page.content;
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;

    // Get the selected date from the form
    const selectedDate: Date = this.form.value.date;

    // Format as Colombian-local ISO string (no timezone)
    const colombianDateTime = this.formatAsColombianLocalIso(selectedDate);

    const payload = {
      productId: this.data.productId,
      attributeSetInstanceId: this.data.attributeSetInstanceId || null,
      price: this.form.value.price,
      date: colombianDateTime, // ← SEND AS STRING, NOT Date
      reason: this.form.value.reason,
      locationId: this.form.value.locationId,
      supplier: this.form.value.idSupplier,
      supplierDoc: this.form.value.supplierDoc || null,
      units: this.form.value.quantity,
      pricesell: this.form.value.pricesell,
    };

    this.stockService.createStockEntry(payload).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error creating stock entry', err);
        this.loading = false;
        alert('Error al crear el movimiento de inventario');
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  // Helper: Format Date as 'YYYY-MM-DDTHH:mm:ss' using its LOCAL components
  // This assumes the Date object's time is meant to be in Colombia (UTC-5)
  private formatAsColombianLocalIso(date: Date): string {
    const pad = (num: number): string => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() is 0-based
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
}