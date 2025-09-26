import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTableModule } from '@angular/material/table'; // Consider using MatTable for better structure
import { MatSortModule } from '@angular/material/sort'; // For sorting if needed
import { MatPaginatorModule } from '@angular/material/paginator'; // For pagination if needed later
import { StockHistoryDto } from '../../../models/stock-history-dto.model';
import { StockMovementReason } from '../../../models/stock-movement-reason.model';
import { StockService } from '../../../services/stock.service';
import { PageDto } from '../../../models/page-dto.model';

export interface StockHistoryModalData {
  locationId: string;
  productId: string;
  attributeSetInstanceId?: string;
}

@Component({
  selector: 'app-stock-history-list-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule, // Add MatTableModule
    MatSortModule, // Add MatSortModule if sorting is needed
    MatPaginatorModule // Add MatPaginatorModule if pagination is needed later
  ],
  templateUrl: './stock-history-list-modal.html',
  styleUrls: ['./stock-history-list-modal.scss']
})
export class StockHistoryListModal implements OnInit {
  history: StockHistoryDto[] = [];
  loading = true;
  movementReasons = StockMovementReason;
  displayedColumns: string[] = ['date', 'reason', 'units', 'price']; // Define columns for MatTable

  // Properties for product and location names, derived from history
  productName: string | undefined;
  locationName: string | undefined;

  //Property to track if the screen is mobile
  isMobile = false;

  constructor(
    private stockService: StockService,
    private dialogRef: MatDialogRef<StockHistoryListModal>,
    @Inject(MAT_DIALOG_DATA) public data: StockHistoryModalData
  ) { }

  ngOnInit() {
    this.loadHistory();
     this.checkScreenSize(); // Check screen size on init
  }

  //Listen to window resize events to update isMobile
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  //Method to determine if the screen is mobile
  private checkScreenSize() {
    // Define your mobile breakpoint (e.g., 768px)
    this.isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed
  }

  loadHistory() {
    this.stockService.getStockHistoryForItem(
      this.data.locationId,
      this.data.productId,
      this.data.attributeSetInstanceId || ''
    ).subscribe({
      next: (history) => {
        this.history = history;
        // Get names from the first history item if available
        if (history && history.length > 0) {
          // Use the productName and locationName from the first item
          // Fallback to ID if name is somehow missing in the DTO
          this.productName = history[0].productName || this.data.productId;
          this.locationName = history[0].locationName || this.data.locationId;
        } else {
          // If no history, use the IDs passed in the data as fallback
          // This is unlikely if the item exists in stock-current-list
          this.productName = this.data.productId;
          this.locationName = this.data.locationId;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stock history:', err);
        // Set fallback names in case of error
        this.productName = this.data.productId;
        this.locationName = this.data.locationId;
        this.loading = false;
        // Optionally, show an error message to the user
      }
    });
  }

  getReasonLabel(reason: number): string {
    switch (reason) {
      case this.movementReasons.PURCHASE: return 'Compra';
      case this.movementReasons.SALE: return 'Venta';
      // Handle specific adjustment codes
      case this.movementReasons.ADJUSTMENT_ADD: return 'Ajuste (Añadir)';
      case this.movementReasons.ADJUSTMENT_MINUS: return 'Ajuste (Restar)';
      // Handle transfer code
      case this.movementReasons.TRANSFER: return 'Movimiento (Transferencia)';
      case this.movementReasons.RETURN_SUPPLIER: return 'Devolución a Proveedor';
      case this.movementReasons.RETURN_CUSTOMER: return 'Devolución de Cliente';
      case this.movementReasons.BREAKAGE: return 'Rotura';
      case this.movementReasons.SAMPLE_OUT: return 'Muestra Saliente';
      case this.movementReasons.FREE: return 'Gratis';
      case this.movementReasons.USED_ITEM: return 'Item Usado';
      case this.movementReasons.RECTIFY_ERROR: return 'Rectificar Error';
      default: return 'Desconocido';
    }
  }


  getReasonIcon(reason: number): string {
    switch (reason) {
      case this.movementReasons.PURCHASE: return 'shopping_cart';
      case this.movementReasons.SALE: return 'sell';
      // Use 'tune' for both add and minus adjustments, or differentiate if desired
      case this.movementReasons.ADJUSTMENT_ADD:
      case this.movementReasons.ADJUSTMENT_MINUS: return 'tune';
      // Use 'compare_arrows' for transfer
      case this.movementReasons.TRANSFER: return 'compare_arrows';
      case this.movementReasons.RETURN_SUPPLIER: return 'reply';
      case this.movementReasons.RETURN_CUSTOMER: return 'reply_all';
      case this.movementReasons.BREAKAGE: return 'broken_image';
      case this.movementReasons.SAMPLE_OUT: return 'local_mall';
      case this.movementReasons.FREE: return 'free_breakfast';
      case this.movementReasons.USED_ITEM: return 'construction'; // Or another relevant icon
      case this.movementReasons.RECTIFY_ERROR: return 'error'; // Or another relevant icon
      default: return 'help';
    }
  }

  getMovementClass(reason: number): string {
    switch (reason) {
      case this.movementReasons.PURCHASE: return 'movement-purchase';
      case this.movementReasons.SALE: return 'movement-sale';
      // Combine adjustment classes or keep separate if needed
      case this.movementReasons.ADJUSTMENT_ADD:
      case this.movementReasons.ADJUSTMENT_MINUS: return 'movement-adjustment';
      case this.movementReasons.TRANSFER: return 'movement-transfer';
      case this.movementReasons.RETURN_SUPPLIER:
      case this.movementReasons.RETURN_CUSTOMER: return 'movement-return';
      case this.movementReasons.BREAKAGE: return 'movement-breakage';
      case this.movementReasons.SAMPLE_OUT: return 'movement-sample';
      case this.movementReasons.FREE: return 'movement-free';
      case this.movementReasons.USED_ITEM: return 'movement-used';
      case this.movementReasons.RECTIFY_ERROR: return 'movement-error';
      default: return 'movement-unknown';
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

  formatPrice(price: number | null | undefined): string {
    if (price == null || price === undefined) {
      return 'N/A';
    }
    // Assuming price is per unit, format as currency if needed, e.g., using Angular's DecimalPipe
    // For now, just format as number with 2 decimals
    return price.toFixed(2);
  }

  close() {
    this.dialogRef.close();
  }
}
