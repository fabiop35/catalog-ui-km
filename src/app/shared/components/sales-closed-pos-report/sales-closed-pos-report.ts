import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTable, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SalesClosedPosReportItem } from '../../models/sales-closed-pos-report-item.model';
import { SalesClosedPos } from '../../services/sales-closed-pos';
import { MatInputModule } from "@angular/material/input";
import { MatDatepicker, MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sales-closed-pos-report',
  templateUrl: './sales-closed-pos-report.html',
  styleUrls: ['./sales-closed-pos-report.scss'],
  standalone: true,
  imports: [
    MatInputModule,
    MatDatepicker,
    MatTable,
    MatTableModule,
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTableModule,
    MatNativeDateModule,
    FormsModule
  ]
})
export class SalesClosedPosReport implements OnInit {

  displayedColumns: string[] = ['host', 'hostSequence', 'dateStart', 'dateEnd', 'payment', 'total'];
  dataSource = new MatTableDataSource<SalesClosedPosReportItem>();
  startDate: Date | null = null; // Store as Date object initially
  endDate: Date | null = null;

  constructor(
    private salesClosedPosService: SalesClosedPos,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    // Convert Date objects to 'dd/MM/yyyy HH:mm' string format before sending
    const startDateStr = this.formatDateForBackend(this.startDate);
    const endDateStr = this.formatDateForBackend(this.endDate);

    this.salesClosedPosService.getReportData(startDateStr, endDateStr).subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (error) => {
        console.error('Error fetching report ', error);
        this.snackBar.open('Error fetching report data.', 'Close', { duration: 3000 });
      }
    });
  }

  exportToPdf(): void {
    // Convert Date objects to 'dd/MM/yyyy HH:mm' string format before sending
    const startDateStr = this.formatDateForBackend(this.startDate);
    const endDateStr = this.formatDateForBackend(this.endDate);

    this.salesClosedPosService.getReportAsPdf(startDateStr, endDateStr).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sales_closed_pos_report.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('PDF downloaded successfully.', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error generating PDF:', error);
        this.snackBar.open('Error generating PDF.', 'Close', { duration: 3000 });
      }
    });
  }

  // Helper function to format Date object to 'dd/MM/yyyy HH:mm' string
  private formatDateForBackend(date: Date | null): string | undefined {
    if (!date) {
      return undefined;
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  // Handler for date picker changes
  onDateRangeChange(): void {
    // Reload data when date range changes
    this.loadReportData();
  }
}