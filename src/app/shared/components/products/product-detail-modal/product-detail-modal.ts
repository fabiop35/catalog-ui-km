import { Component, Inject, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs'; // Import Tabs Module
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For loading spinner
import { MatListModule } from '@angular/material/list'; // For displaying stock list
import { MatChipsModule } from '@angular/material/chips'; // For location/variant chips

import { ProductWithCategoryDto } from '../../../models/product-with-category.model';
import { QRCodeComponent } from "angularx-qrcode";
import { StockCurrentDto } from '../../../models/stock-current.dto.model';
import { StockService } from '../../../services/stock.service';

@Component({
  selector: 'app-product-detail-modal',
  templateUrl: './product-detail-modal.html',
  styleUrls: ['./product-detail-modal.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatButtonModule,
    QRCodeComponent,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatChipsModule
  ]
})
export class ProductDetailModal {


  @ViewChild('printSection') printSection!: ElementRef;

  rrp: number = 0;
  markup: number = 0;
  margin: number = 0;

   // Inventory Tab Properties
  stockItems: StockCurrentDto[] = [];
  stockLoading = false;
  stockError: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<ProductDetailModal>,
    @Inject(MAT_DIALOG_DATA) public data: { product: ProductWithCategoryDto },
    private stockService: StockService
  ) {
    this.calculateMetrics();
    this.loadProductStock(); // Load stock details when modal opens
  }

  private calculateMetrics() {
    const { pricesell, pricebuy, taxRate } = this.data.product;

    this.rrp = pricesell * (1 + (taxRate || 0));
    this.markup = pricebuy > 0 ? (pricesell - pricebuy) / pricebuy : 0;
    this.margin = pricesell > 0 ? (pricesell - pricebuy) / pricesell : 0;
  }

  // Load stock details for the specific product
  private loadProductStock() {
    this.stockLoading = true;
    this.stockError = null;
    // Assuming the backend has an endpoint like /stock/current/product/{productId}
    // If not, you might need to fetch all stock and filter client-side, or add the endpoint
    this.stockService.getCurrentStockByLocation('ALL') // This might need adjustment if you have a specific product endpoint
      .subscribe({
        next: (allStockItems) => {
          // Filter stock items for the specific product
          this.stockItems = allStockItems.filter(item => item.productId === this.data.product.id);
          this.stockLoading = false;
        },
        error: (err) => {
          console.error('Error loading stock for product:', err);
          this.stockError = 'Error al cargar inventario para este producto.';
          this.stockLoading = false;
        }
      });

    // Alternative approach if there's a specific endpoint for product stock:
    // this.stockService.getStockByProductId(this.data.product.id!).subscribe({
    //   next: (items) => {
    //     this.stockItems = items;
    //     this.stockLoading = false;
    //   },
    //   error: (err) => {
    //     console.error('Error loading stock for product:', err);
    //     this.stockError = 'Error al cargar inventario.';
    //     this.stockLoading = false;
    //   }
    // });
  }

  /*getImageUrl(): string {
    if (this.data.product.image) {
      // If image is base64
      return `data:image/jpeg;base64,${this.data.product.image}`;
    }
    return 'assets/images/no-image.png'; // Add a placeholder
  }*/

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Optional: show snackbar
      console.log('Copied to clipboard:', text);
    });
  }

  print() {
    const printContent = this.printSection.nativeElement.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Restore Angular app
  }

  getMarkupClass(value: number): string {
    if (value >= 0.5) return 'high-margin';
    if (value >= 0.2) return 'medium-margin';
    return 'low-margin';
  }

  getMarginClass(value: number): string {
    return this.getMarkupClass(value);
  }

  getTrendIcon(value: number): string {
    if (value >= 0.5) return 'trending_up';
    if (value >= 0.2) return 'trending_flat';
    return 'trending_down';
  }

  getProfitTooltip(): string {
    const { pricesell, pricebuy } = this.data.product;
    return `
      Margen = ((${pricesell} - ${pricebuy}) / ${pricebuy}) × 100
      Beneficio Bruto = ((${pricesell} - ${pricebuy}) / ${pricesell}) × 100
    `.trim();
  }

  close(): void {
    this.dialogRef.close();
  }

  getQrData(): string {
    // Use product code or reference as unique ID
    return this.data.product.code || this.data.product.reference;
  }

  downloadQrCode() {
    const canvas = document.querySelector('.qr-container canvas') as HTMLCanvasElement;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${this.data.product.reference}.png`;
    a.click();
  }

  async exportToPdf() {
    try {
      // ✅ Dynamically import jsPDF
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable'); // Optional: for tables

      const product = this.data.product;
      const { pricesell, pricebuy, taxRate } = product;

      // Calculate values
      const rrp = pricesell * (1 + (taxRate || 0));
      const markup = pricebuy > 0 ? ((pricesell - pricebuy) / pricebuy) * 100 : 0;
      const margin = pricesell > 0 ? ((pricesell - pricebuy) / pricesell) * 100 : 0;

      // Create PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      const width = doc.internal.pageSize.getWidth();
      let y = 20;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(0, 64, 128);
      doc.text('Detalles del Producto', 14, y);
      y += 10;

      // Separator
      doc.setDrawColor(200);
      doc.line(14, y, width - 14, y);
      y += 10;

      // Product Info
      doc.setFontSize(12);
      doc.setTextColor(0);

      const addLine = (label: string, value: string) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 60, y);
        y += 8;
      };

      addLine('Nombre:', product.name);
      addLine('Referencia:', product.reference);
      addLine('Código:', product.code);
      addLine('Tipo de Código:', product.codetype || 'N/A');
      addLine('Categoría:', product.categoryName || 'No asignada');
      const taxRate1 = product.taxRate ?? 0;
      addLine('Impuesto:', `${product.taxName || 'Sin impuesto'} (${(taxRate1 * 100).toFixed(0)}%)`);
      addLine('Proveedor:', product.supplierName || 'No asignado');

      y += 5;
      doc.setDrawColor(220);
      doc.line(14, y, width - 14, y);
      y += 10;

      // Pricing
      doc.setFontSize(14);
      doc.setTextColor(0, 100, 0);
      doc.text('Precios', 14, y);
      y += 8;

      doc.setFontSize(12);
      doc.setTextColor(0);
      addLine('Precio de Compra:', this.formatCurrency(pricebuy));
      addLine('Precio de Venta:', this.formatCurrency(pricesell));
      addLine('*PVP (con IVA):', this.formatCurrency(rrp));

      y += 5;
      doc.line(14, y, width - 14, y);
      y += 10;

      // Profitability
      doc.setFontSize(14);
      doc.setTextColor(128, 0, 128);
      doc.text('Rentabilidad', 14, y);
      y += 8;

      doc.setFontSize(12);
      doc.setTextColor(0);
      addLine('Margen:', `${markup.toFixed(2)}%`);
      addLine('Beneficio Bruto:', `${margin.toFixed(2)}%`);

      // Footer
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, y);

      // Save PDF
      doc.save(`producto-${product.reference}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
      alert('Error al generar PDF. Intente de nuevo.');
    }
  }



  shareViaWhatsApp() {
    const product = this.data.product;
    const { taxRate } = product;

    const rrp = product.pricesell  * (1 + (taxRate || 0));

    const message = encodeURIComponent(
      `📦 *${product.name}*\n` +
      `🔍 Ref: ${product.reference}\n` +
      `🔢 Código: ${product.code}\n` +
      `💰 Precio: ${ this.formatCurrency(rrp)}  \n\n` +
      `👉 Más info: https://everest.com/productos/${product.id}`
    );
    const url = `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
    // Uses wa.me link format
    //Opens WhatsApp Web or mobile app
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(value);
  }

  // Helper method to determine stock status class (similar to stock-current-list)
  getStockStatusClass(units: number): string {
    if (units <= 0) return 'stock-status-out';
    if (units < 5) return 'stock-status-low';
    return 'stock-status-available';
  }

  // Helper method to determine stock status color (similar to stock-current-list)
  getStockStatusColor(units: number): 'primary' | 'accent' | 'warn' {
    if (units <= 0) return 'warn';
    if (units < 5) return 'accent';
    return 'primary';
  }

  // Helper method to determine stock status text (similar to stock-current-list)
  getStockStatus(units: number): string {
    if (units <= 0) return 'Sin stock';
    if (units < 5) return 'Bajo';
    return 'Disponible';
  }
}