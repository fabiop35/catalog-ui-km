import { Component, Inject, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

import { ProductWithCategoryDto } from '../../../models/product-with-category.model';

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
    MatButtonModule
  ]
})
export class ProductDetailModal {
  @ViewChild('printSection') printSection!: ElementRef;

  rrp: number = 0;
  markup: number = 0;
  margin: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ProductDetailModal>,
    @Inject(MAT_DIALOG_DATA) public data: { product: ProductWithCategoryDto }
  ) {
    this.calculateMetrics();
  }

  private calculateMetrics() {
    const { pricesell, pricebuy, taxRate } = this.data.product;

    this.rrp = pricesell * (1 + (taxRate || 0));
    this.markup = pricebuy > 0 ? (pricesell - pricebuy) / pricebuy : 0;
    this.margin = pricesell > 0 ? (pricesell - pricebuy) / pricesell : 0;
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
}