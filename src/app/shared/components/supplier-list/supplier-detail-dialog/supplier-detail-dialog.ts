import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule, MatChipSet } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Supplier } from '../../../models/supplier.model';
import { StockDiary } from '../../../models/stockdiary.model';
import { CatalogService } from '../../../services/catalog';
import { MatIconModule } from "@angular/material/icon";



@Component({
  selector: 'app-supplier-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule,
    MatChipSet,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule
],
  templateUrl: './supplier-detail-dialog.html',
  styleUrls: ['./supplier-detail-dialog.scss']
})
export class SupplierDetailDialog implements OnInit {

  displayedColumns = ['date', 'product', 'units', 'price', 'reason'];
  stockDiary: StockDiary[] = [];
  loading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { supplier: any },
    private catalog: CatalogService
  ) { }

  ngOnInit() {
    this.catalog.getStockDiary(this.data.supplier.id).subscribe({
      next: list => {
        this.stockDiary = list;
        this.loading = false;
      },
      error: () => {
        this.stockDiary = [];
        this.loading = false;
      }
    });
  }


}