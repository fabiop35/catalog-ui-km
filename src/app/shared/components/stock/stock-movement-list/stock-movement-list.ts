import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { takeUntil, Subject } from 'rxjs';

import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { StockHistoryDto } from '../../../models/stock-history-dto.model';
import { StockMovementReason } from '../../../models/stock-movement-reason.model';
import { StockService } from '../../../services/stock.service';
import { LocationSelectorComponent } from '../location-selector/location-selector';
import { StockMovementDetailModal } from '../stock-movement-detail-modal/stock-movement-detail-modal';


@Component({
  selector: 'app-stock-movement-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTooltipModule,
    MatNativeDateModule
  ],
  templateUrl: './stock-movement-list.html',
  styleUrls: ['./stock-movement-list.scss']
})
export class StockMovementList implements OnInit, OnDestroy {
  movements: StockHistoryDto[] = [];
  loading = false;
  page = 0;
  pageSize = 20;
  hasMore = true;
  selectedLocationId: string | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;
  reasonFilter: number | null = null;
  private destroy$ = new Subject<void>();
  movementReasons = StockMovementReason;

  reasons = [
    { id: 0, name: 'Compra' },
    { id: 1, name: 'Venta' },
    { id: 2, name: 'Ajuste' },
    { id: 3, name: 'Movimiento' }
  ];

  constructor(
    private stockService: StockService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // In stock-movement-list.component.ts
  load() {
    if (this.loading) return;

    this.loading = true;

    // Create a clean params object with only defined values
    const params: any = {
      page: this.page,
      size: this.pageSize
    };

    if (this.selectedLocationId) params.locationId = this.selectedLocationId;
    if (this.startDate) params.startDate = this.formatDate(this.startDate);
    if (this.endDate) params.endDate = this.formatDate(this.endDate);
    if (this.reasonFilter !== null) params.reason = this.reasonFilter;

    this.stockService.getStockMovements(params)
      .subscribe({
        next: (data) => {
          this.movements = [...this.movements, ...data.content];
          this.hasMore = this.page < data.totalPages - 1;
          this.page++;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading stock movements:', err);
          this.loading = false;
        }
      });
  }

  resetAndReload() {
    this.page = 0;
    this.movements = [];
    this.hasMore = true;
    this.load();
  }

  openLocationSelector() {
    const dialogRef = this.dialog.open(LocationSelectorComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedLocationId = result;
        this.resetAndReload();
      }
    });
  }

  openMovementDetail(movement: StockHistoryDto) {
    const dialogRef = this.dialog.open(StockMovementDetailModal, {
      width: '800px',
      maxWidth: '95vw',
      data: {
        movementId: movement.id
      }
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getReasonLabel(reason: number): string {
    const reasonObj = this.reasons.find(r => r.id === reason);
    return reasonObj ? reasonObj.name : 'Desconocido';
  }

  getMovementClass(reason: number): string {
    switch (reason) {
      case 0: return 'movement-purchase';
      case 1: return 'movement-sale';
      case 2: return 'movement-adjustment';
      case 3: return 'movement-transfer';
      default: return '';
    }
  }

  applyFilters() {
    this.resetAndReload();
  }

  clearFilters() {
    this.startDate = null;
    this.endDate = null;
    this.reasonFilter = null;
    this.resetAndReload();
  }
}