import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { debounceTime, Subject, takeUntil, tap, switchMap, startWith, distinctUntilChanged, of, Observable } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StockCurrentDto } from '../../../models/stock-current.dto.model';
import { StockService } from '../../../services/stock.service';
import { LocationSelectorComponent } from '../location-selector/location-selector';
import { StockAdjustmentModal } from '../stock-adjustment-modal/stock-adjustment-modal';
import { StockMovementDetailModal } from '../stock-movement-detail-modal/stock-movement-detail-modal';
import { PageDto } from '../../../models/page-dto.model';
import { StockHistoryListModal } from '../stock-history-list-modal/stock-history-list-modal';
import { BarcodeScanner } from '../../barcode-scanner/barcode-scanner'; 



type SearchResult = { content: StockCurrentDto[]; last: boolean; } | PageDto<StockCurrentDto>;

@Component({
  selector: 'app-stock-current-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    BarcodeScanner
  ],
  templateUrl: './stock-current-list.html',
  styleUrls: ['./stock-current-list.scss']
})

export class StockCurrentList implements OnInit, AfterViewInit, OnDestroy {

  page = 0;
  pageSize = 20;
  stockItems: StockCurrentDto[] = [];
  hasMore = true;
  loading = false;
  searchCtrl = new FormControl('');
  searchResults: StockCurrentDto[] = [];
  selectedLocationId: string | null = null;
  isSearching = false;
  private destroy$ = new Subject<void>();
  @ViewChild('searchInput') searchInput!: ElementRef;
  searchTerm = ''; // Track the actual search term separately

  trackById = (index: number, item: StockCurrentDto) =>
    `${item.locationId}-${item.productId}-${item.attributeSetInstanceId || 'default'}`;



  constructor(
    private stockService: StockService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.load();
    //this.setupSearch();
  }

  ngAfterViewInit() {
    // Ensure focus is set properly after view initialization
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 100);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Complete search setup with proper handling of all edge cases
  private setupSearch() {
    this.searchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => {
        // Properly handle term being an object or string
        const searchTerm = this.getSearchTerm(term);
        this.searchTerm = searchTerm;

        // Reset state when search is cleared
        if (!searchTerm) {
          this.isSearching = false;
          this.searchResults = [];
          this.cdr.detectChanges();
          return;
        }

        this.isSearching = true;
        this.loading = true;
      }),
      switchMap(term => {
        const searchTerm = this.getSearchTerm(term);

        if (!searchTerm) {
          return of({ content: [], last: true });
        }

        return this.stockService.getCurrentStock(0, this.pageSize, searchTerm, this.selectedLocationId).pipe(
          tap(() => this.loading = false)
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: SearchResult) => {
        this.handleSearchResults(data.content);
      },
      error: (err: any) => {
        console.error('Error searching stock:', err);
        this.searchResults = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Handle term being string, object, or null safely
  private getSearchTerm(term: any): string {
    if (typeof term === 'string') {
      return term.trim();
    } else if (term && term.productName) {
      return term.productName.trim();
    }
    return '';
  }

  // Properly handle search results with deduplication
  private handleSearchResults(results: StockCurrentDto[]) {
    // Deduplicate results by using a Map with unique keys
    const uniqueResults = new Map<string, StockCurrentDto>();

    for (const item of results) {
      const key = `${item.productId}-${item.attributeSetInstanceId || 'default'}`;
      uniqueResults.set(key, item);
    }

    this.searchResults = Array.from(uniqueResults.values());
    this.cdr.detectChanges();
  }

  // Properly handle autocomplete selection
  onSearchSelected(event: MatAutocompleteSelectedEvent) {
    const selected = event.option.value as StockCurrentDto;

    if (selected && selected.productName) {
      // Set the form control to the product name string only
      this.searchCtrl.setValue(selected.productName);
      this.searchResults = [selected];
      this.isSearching = true;
      this.cdr.detectChanges();
    }
  }

  // Complete search reset that handles all edge cases
  clearSearch() {
    this.searchCtrl.setValue('');
    this.searchTerm = '';
    this.searchResults = [];
    this.isSearching = false;

    // Reset to initial state
    this.page = 0;
    this.stockItems = [];
    this.hasMore = true;
    this.load();

    // Refocus input
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 0);
  }

  load() {
    if (this.loading || this.isSearching) return;
    this.loading = true;
    const searchTerm = this.searchTerm;
    this.stockService.getCurrentStock(this.page, this.pageSize, searchTerm, this.selectedLocationId)
      .pipe(
        tap(() => this.loading = false)
      )
      .subscribe({
        next: (data: PageDto<StockCurrentDto>) => {
          // Only append if not searching
          if (!this.isSearching) {
            this.stockItems = [...this.stockItems, ...data.content];
            this.hasMore = !data.last;
            this.page++;
          }
        },
        error: (err: any) => {
          console.error('Error loading stock:', err);
          this.snack.open('Error al cargar inventario', 'Cerrar', { duration: 6000 });
          this.loading = false;
        }
      });
  }

  resetAndReload() {
    this.page = 0;
    this.stockItems = [];
    this.hasMore = true;
    this.isSearching = false;
    this.searchResults = [];
    this.searchTerm = '';
    this.searchCtrl.setValue('');
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

  adjustStock(item: StockCurrentDto) {
    const dialogRef = this.dialog.open(StockAdjustmentModal, {
      width: '500px',
      data: {
        locationId: item.locationId,
        productId: item.productId,
        attributeSetInstanceId: item.attributeSetInstanceId,
        currentStock: item.units
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.resetAndReload();
        this.snack.open('Inventario actualizado', 'Cerrar', { duration: 3000 });
      }
    });
  }

  /*viewHistory(item: StockCurrentDto) {
    const dialogRef = this.dialog.open(StockMovementDetailModal, {
      width: '800px',
      maxWidth: '95vw',
      data: {
        locationId: item.locationId,
        productId: item.productId,
        attributeSetInstanceId: item.attributeSetInstanceId
      }
    });
  }*/

  getStockStatus(units: number): string {
    if (units <= 0) return 'Sin stock';
    if (units < 5) return 'Bajo';
    return 'Disponible';
  }

  getStockStatusClass(units: number): string {
    if (units <= 0) return 'stock-status-out';
    if (units < 5) return 'stock-status-low';
    return 'stock-status-available';
  }

  getStockStatusColor(units: number): 'primary' | 'accent' | 'warn' {
    if (units <= 0) return 'warn';
    if (units < 5) return 'accent';
    return 'primary';
  }

  // Display function for autocomplete
  displayFn(item: any): string {
    return item && item.productName ? item.productName : '';
  }

  viewHistory(item: StockCurrentDto) {
    // Open the NEW StockHistoryListModal
    const dialogRef = this.dialog.open(StockHistoryListModal, {
      width: '900px', // Adjust width as needed
      maxWidth: '95vw',
      maxHeight: '80vh', // Limit height
      data: {
        locationId: item.locationId,
        productId: item.productId,
        attributeSetInstanceId: item.attributeSetInstanceId,
      }
    });
  }

  // NEW: Method to open the barcode scanner modal
  openBarcodeScanner() {
    const dialogRef = this.dialog.open(BarcodeScanner, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      autoFocus: false
    });

    // Subscribe to the scanner's output event
    dialogRef.componentInstance.codeScanned.subscribe((code: string) => {
      this.handleScannedCode(code);
      dialogRef.close(); // Close the scanner modal after scanning
    });
  }

  // UPDATED: Method to handle the scanned barcode code
  handleScannedCode(code: string) {
    console.log('Scanned code:', code);
    // Set the search term to the scanned code to potentially trigger text search if needed
    // However, we will handle the results from the specific API call directly.
    this.searchCtrl.setValue(code);

    // Search for stock items using the code via the NEW StockService method
    this.stockService.getCurrentStockByProductCode(code, this.selectedLocationId).subscribe({
      next: (stockItems: StockCurrentDto[]) => {
        console.log('Stock items found by code:', stockItems);
        if (stockItems.length > 0) {
          // Clear any previous search results
          this.searchResults = [];
          // Set the new results from the barcode scan
          this.searchResults = stockItems;
          // Mark as searching to display the search results grid
          this.isSearching = true;
          // Stop loading state
          this.loading = false;
          // Trigger change detection to update the UI
          this.cdr.detectChanges();

          // Show success message
          this.snack.open(`Código encontrado: ${stockItems[0].productName}`, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        } else {
          // No stock items found with the scanned code
          this.searchResults = []; // Clear previous results
          this.isSearching = true; // Mark as searching to show the "no results" state in the search section
          this.loading = false; // Stop loading state
          this.cdr.detectChanges(); // Ensure UI updates

          // Show not found message
          this.snack.open('Código no encontrado en inventario', 'Cerrar', {
            duration: 0,
            horizontalPosition: 'center',
            //verticalPosition: 'bottom',    // or 'top'
            //panelClass: ['error-snackbar']
          });
        }
      },
      error: (err: any) => {
        console.error('Error searching stock by code:', err);
        this.searchResults = []; // Clear results on error
        this.isSearching = true; // Mark as searching to show state
        this.loading = false; // Stop loading state on error
        this.cdr.detectChanges(); // Ensure UI updates

        // Show error message
        this.snack.open('Error al buscar inventario por código', 'Cerrar', {
          duration: 0,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

}