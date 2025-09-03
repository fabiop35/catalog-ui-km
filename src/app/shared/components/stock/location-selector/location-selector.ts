import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { StockService } from '../../../services/stock.service';
import { Location as LocationModel } from '../../../models/location.model';

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './location-selector.html',
  styleUrls: ['./location-selector.scss']
})
export class LocationSelectorComponent implements OnInit {
  locations: LocationModel[] = [];
  loading = true;
  selectedLocationId: string | null = null;

  constructor(
    private stockService: StockService,
    private dialogRef: MatDialogRef<LocationSelectorComponent>
  ) { }

  ngOnInit() {
    this.loadLocations();
  }

  loadLocations() {
    this.stockService.getLocations().subscribe({
      next: (data: LocationModel[]) => {
        this.locations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading locations:', err);
        this.loading = false;
      }
    });
  }

  selectLocation(location: LocationModel) {
    this.selectedLocationId = location.id;
    // Add a small delay for visual feedback
    setTimeout(() => {
      this.dialogRef.close(location.id);
    }, 150);
  }

  cancel() {
    this.dialogRef.close();
  }
}