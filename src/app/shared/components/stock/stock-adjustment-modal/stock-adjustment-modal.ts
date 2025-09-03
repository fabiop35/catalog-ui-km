import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { takeUntil, Subject } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { StockService } from '../../../services/stock.service';


export interface StockAdjustmentData {
  locationId: string;
  productId: string;
  attributeSetInstanceId?: string;
  currentStock: number;
}

@Component({
  selector: 'app-stock-adjustment-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './stock-adjustment-modal.html',
  styleUrls: ['./stock-adjustment-modal.scss']
})
export class StockAdjustmentModal implements OnInit {
  adjustmentForm: FormGroup;
  currentStock: number;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<StockAdjustmentModal>,
    @Inject(MAT_DIALOG_DATA) public data: StockAdjustmentData
  ) {
    this.currentStock = data.currentStock;

    this.adjustmentForm = this.fb.group({
      newStock: [data.currentStock, [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit() {
    // Watch for changes in newStock to calculate adjustment
    this.adjustmentForm.get('newStock')?.valueChanges.subscribe(value => {
      if (value !== null && value !== undefined) {
        const adjustment = value - this.currentStock;
        // You could add a label to show the adjustment amount in the UI if needed
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    if (this.adjustmentForm.invalid) return;

    const { newStock, notes } = this.adjustmentForm.value;
    const adjustment = newStock - this.currentStock;

    // Get actual user ID from auth service
    const userId = 'current-user-id'; // This should be replaced with actual user ID

    this.stockService.adjustStock(
      this.data.locationId,
      this.data.productId,
      this.data.attributeSetInstanceId || '',
      newStock,
      notes
    ).subscribe({
      next: () => {
        this.snack.open('Stock ajustado correctamente', 'Cerrar', { duration: 3000 });
        this.close(true);
      },
      error: (err) => {
        console.error('Error adjusting stock:', err);
        this.snack.open(err.message || 'Error al ajustar el stock', 'Cerrar', { duration: 3000 });
      }
    });
  }

  close(result = false) {
    if (this.destroy$ && !this.destroy$.closed) {
      this.destroy$.next();
      this.destroy$.complete();
    }
    this.dialogRef.close(result);
  }

  get adjustmentAmount(): number {
    const newStock = this.adjustmentForm.get('newStock')?.value;
    return newStock - this.currentStock;
  }

  get isIncrease(): boolean {
    return this.adjustmentAmount > 0;
  }
}