import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InventoryItemValuationDto, InventoryValuationDto } from '../../../models/inventory-item-valuation-dto.model';
import { StockService } from '../../../services/stock.service';



@Component({
  selector: 'app-inventory-valuation-report',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './inventory-valuation-report.html',
  styleUrls: ['./inventory-valuation-report.scss']
})
export class InventoryValuationReport implements OnInit {
  valuation: InventoryValuationDto | null = null;
  loading = false;
  sortBy: 'value' | 'units' | 'name' = 'value';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private stockService: StockService) {}

  ngOnInit() {
    this.loadValuation();
  }

  loadValuation() {
    this.loading = true;
    this.stockService.getInventoryValuation().subscribe({
      next: (data) => {
        this.valuation = data;
        this.sortItems();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading inventory valuation:', err);
        this.loading = false;
      }
    });
  }

  sortItems() {
    if (!this.valuation?.items) return;
    
    this.valuation.items.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'value':
          comparison = a.itemValue - b.itemValue;
          break;
        case 'units':
          comparison = a.units - b.units;
          break;
        case 'name':
          comparison = a.productName.localeCompare(b.productName);
          break;
      }
      
      return this.sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  toggleSort(field: 'value' | 'units' | 'name') {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'desc';
    }
    
    this.sortItems();
  }

  getSortIcon(field: 'value' | 'units' | 'name'): string {
    if (this.sortBy !== field) return 'sort';
    return this.sortDirection === 'desc' ? 'south' : 'north';
  }

  exportToPdf() {
    if (!this.valuation) return;
    
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Reporte de Valoración de Inventario', 14, 22);
    
    // Total value
    doc.setFontSize(14);
    doc.text(`Valor Total del Inventario: $${this.valuation.totalValue.toFixed(2)}`, 14, 35);
    
    // Table
    const tableData = this.valuation.items.map(item => [
      item.productName,
      item.units.toFixed(2),
      `$${item.costPrice.toFixed(2)}`,
      `$${item.itemValue.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      head: [['Producto', 'Unidades', 'Precio Costo', 'Valor Total']],
      body: tableData,
      startY: 45,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [63, 81, 181] }
    });
    
    // Footer with date
    const date = new Date();
    doc.setFontSize(10);
    doc.text(`Reporte generado el: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, 
             14, doc.internal.pageSize.height - 10);
    
    doc.save(`inventario-valoracion-${date.toISOString().split('T')[0]}.pdf`);
  }

  getItemValueClass(item: InventoryItemValuationDto): string {
    const percentage = item.itemValue / this.valuation!.totalValue;
    if (percentage > 0.1) return 'high-value';
    if (percentage > 0.05) return 'medium-value';
    return 'low-value';
  }
}