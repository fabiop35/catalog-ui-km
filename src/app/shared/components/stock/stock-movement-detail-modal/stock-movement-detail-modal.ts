import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StockHistoryDto } from '../../../models/stock-history-dto.model';
import { StockMovementReason } from '../../../models/stock-movement-reason.model';
import { StockService } from '../../../services/stock.service';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

export interface StockMovementDetailData {
  movementId?: string;
  locationId?: string;
  productId?: string;
  attributeSetInstanceId?: string;
}

@Component({
  selector: 'app-stock-movement-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './stock-movement-detail-modal.html',
  styleUrls: ['./stock-movement-detail-modal.scss']
})

export class StockMovementDetailModal implements OnInit {

  movement: StockHistoryDto | null = null;
  loading = true;
  movementReasons = StockMovementReason;

  constructor(
    private stockService: StockService,
    private dialogRef: MatDialogRef<StockMovementDetailModal>,
    @Inject(MAT_DIALOG_DATA) public data: StockMovementDetailData
  ) { }

  ngOnInit() {
    this.loadMovement();
  }

  loadMovement() {
    if (this.data.movementId) {
      this.loadMovementById();
    } else if (this.data.locationId && this.data.productId) {
      this.loadRecentMovement();
    }
  }

  loadMovementById() {
    this.stockService.getStockMovementById(this.data.movementId!)
      .subscribe({
        next: (movement) => {
          this.movement = movement;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading movement:', err);
          this.loading = false;
        }
      });
  }

  loadRecentMovement() {
    this.stockService.getStockMovementsForProduct(
      this.data.locationId!,
      this.data.productId!,
      this.data.attributeSetInstanceId || ''
    ).subscribe({
      next: (movements) => {
        if (movements.length > 0) {
          this.movement = movements[0];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading movements:', err);
        this.loading = false;
      }
    });
  }

  getReasonLabel(reason: number): string {
    switch (reason) {
      case this.movementReasons.PURCHASE: return 'Compra';
      case this.movementReasons.SALE: return 'Venta';
      case this.movementReasons.ADJUSTMENT: return 'Ajuste';
      case this.movementReasons.MOVEMENT: return 'Movimiento';
      default: return 'Desconocido';
    }
  }

  getReasonIcon(reason: number): string {
    switch (reason) {
      case this.movementReasons.PURCHASE: return 'shopping_cart';
      case this.movementReasons.SALE: return 'sell';
      case this.movementReasons.ADJUSTMENT: return 'tune';
      case this.movementReasons.MOVEMENT: return 'compare_arrows';
      default: return 'help';
    }
  }

  getMovementClass(reason: number): string {
    switch (reason) {
      case this.movementReasons.PURCHASE: return 'movement-purchase';
      case this.movementReasons.SALE: return 'movement-sale';
      case this.movementReasons.ADJUSTMENT: return 'movement-adjustment';
      case this.movementReasons.MOVEMENT: return 'movement-transfer';
      default: return '';
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatUnits(units: number): string {
    return units >= 0 ? `+${units}` : `${units}`;
  }

  close() {
    this.dialogRef.close();
  }
}