// stock-current-list.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { debounceTime, Subject, takeUntil, tap, switchMap, startWith, distinctUntilChanged, of, Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Import map operator explicitly
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
import { StockEntryModalComponent } from '../stock-entry-modal.component/stock-entry-modal.component';

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
    // Set up the autocomplete search *before* loading the main list
    this.setupSearch();
    // Load the initial main list after setting up search
    this.loadMainList(); // Renamed from 'load' to be clearer
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

  // Set up the autocomplete search logic
  private setupSearch() {
    this.searchCtrl.valueChanges.pipe(
      startWith(''), // Trigger initial load with empty string
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(), // Only proceed if the value actually changed
      tap(term => {
        // Handle term being a string (user typing) or an object (selected from autocomplete)
        const searchTerm = this.getSearchTerm(term);
        this.searchTerm = searchTerm;

        // If user cleared the search box
        if (!searchTerm) {
          console.log("Search cleared, showing main list.");
          this.isSearching = false;
          this.searchResults = [];
          // Optionally, reload the main list here if desired when clearing
          // this.resetMainList(); // Uncomment if you want to reset main list on clear
          this.cdr.detectChanges();
          return;
        }

        console.log("Search term changed:", searchTerm);
        // User is searching, show loading state in autocomplete area
        this.isSearching = true;
        this.loading = true; // This loading state is for the search results area
        this.cdr.detectChanges();
      }),
      switchMap(term => {
        const searchTerm = this.getSearchTerm(term);
        if (!searchTerm) {
          // If cleared, return empty results to clear the autocomplete list
          return of([]);
        }

        // Call the search API with the text term
        // Note: Adjust the service call if location filter should apply to autocomplete results
        console.log("Calling search API with term:", searchTerm);
        // Assuming the existing getCurrentStock can handle a 'search' parameter effectively
        // for text-based searching.
        return this.stockService.getCurrentStock(0, this.pageSize, searchTerm, this.selectedLocationId).pipe(
          map((page: PageDto<StockCurrentDto>) => page.content) // Extract content array from page object for autocomplete, explicitly type 'page'
        );
        // If the service method doesn't exist or isn't suitable for autocomplete,
        // you might need to add a new method in StockService like:
        // getCurrentStockByText(searchTerm: string, locationId?: string): Observable<StockCurrentDto[]>
        // and call that here.
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: StockCurrentDto[]) => { // Explicitly type the data received by next
        console.log("Search API response:", data);
        this.handleSearchResults(data);
        this.loading = false; // Stop loading state for search results
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error searching stock:', err);
        this.searchResults = [];
        this.loading = false;
        this.cdr.detectChanges();
        this.snack.open('Error al buscar inventario', 'Cerrar', { duration: 6000 });
      }
    });
  }

  // Handle term being string, object (selected from autocomplete), or null safely
  private getSearchTerm(term: any): string {
    if (typeof term === 'string') {
      return term.trim();
    } else if (term && typeof term === 'object' && term.productName) {
      // This happens when an option is selected from the autocomplete
      return term.productName.trim();
    }
    return '';
  }

  // Properly handle search results with deduplication (though less likely needed for autocomplete)
  private handleSearchResults(results: StockCurrentDto[]) {
    // Deduplicate results by using a Map with unique keys if necessary
    // For autocomplete, this might be less critical than for infinite scroll
    // const uniqueResults = new Map<string, StockCurrentDto>();
    // for (const item of results) {
    //   const key = `${item.productId}-${item.attributeSetInstanceId || 'default'}`;
    //   uniqueResults.set(key, item);
    // }
    // this.searchResults = Array.from(uniqueResults.values());
    this.searchResults = results; // Assuming API returns unique/desired results
    this.cdr.detectChanges();
  }

  // Properly handle autocomplete selection
  onSearchSelected(event: MatAutocompleteSelectedEvent) {
    const selected = event.option.value as StockCurrentDto;
    if (selected && selected.productName) {
      // Set the form control to the product name string only
      this.searchCtrl.setValue(selected.productName);
      // The search results are already set by the valueChanges stream
      // triggered by setValue, so searchResults should contain the selected item
      this.isSearching = true; // Ensure we are in search mode to show results
      console.log("Autocomplete option selected, showing search results.");
      this.cdr.detectChanges();
    }
  }

  // Complete search reset that handles all edge cases (for the clear button)
  clearSearch() {
    console.log("Clear search button clicked.");
    this.searchCtrl.setValue('');
    this.searchTerm = '';
    this.searchResults = [];
    this.isSearching = false;
    // Reset to initial state for main list
    this.page = 0;
    this.stockItems = [];
    this.hasMore = true;
    this.loadMainList(); // Reload the main list
    // Refocus input
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 0);
  }

  // Load the main paginated list (not search results)
  loadMainList() {
    if (this.loading || this.isSearching) { // Don't load main list if searching or already loading
      console.log("Skipping main list load - loading:", this.loading, "isSearching:", this.isSearching);
      return;
    }
    console.log("Loading main list, page:", this.page, "searchTerm:", this.searchTerm);
    this.loading = true;
    // Use the original service call for the main list, passing current searchTerm if applicable
    // If searchTerm is empty, this should load all items; if not, it searches
    this.stockService.getCurrentStock(this.page, this.pageSize, this.searchTerm, this.selectedLocationId)
      .pipe(
        tap(() => this.loading = false)
      )
      .subscribe({
        next: (data: PageDto<StockCurrentDto>) => { // Explicitly type the data received by next for main list
          // Only append if not searching (i.e., we are on the main list view)
          if (!this.isSearching) {
            console.log("Appending main list data, page:", this.page, "items:", data.content.length);
            this.stockItems = [...this.stockItems, ...data.content];
            this.hasMore = !data.last;
            this.page++;
          } else {
            console.log("Received main list data but isSearching=true, ignoring for main list.");
          }
        },
        error: (err: any) => {
          console.error('Error loading main stock list:', err);
          this.snack.open('Error al cargar inventario', 'Cerrar', { duration: 6000 });
          this.loading = false;
        }
      });
  }

  resetAndReload() {
    console.log("Reset and reload triggered.");
    this.page = 0;
    this.stockItems = [];
    this.hasMore = true;
    this.isSearching = false; // Reset search state
    this.searchResults = [];
    this.searchTerm = '';
    this.searchCtrl.setValue(''); // Clear the input field
    this.loadMainList(); // Reload the main list
  }

  openLocationSelector() {
    const dialogRef = this.dialog.open(LocationSelectorComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedLocationId = result;
        this.resetAndReload(); // Reload list with new location filter
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
    const dialogRef = this.dialog.open(StockHistoryListModal, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '80vh',
      data: {
        locationId: item.locationId,
        productId: item.productId,
        attributeSetInstanceId: item.attributeSetInstanceId,
      }
    });
  }

  // Method to open the barcode scanner modal
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

  // Method to handle the scanned barcode code
  handleScannedCode(code: string) {
    console.log('Scanned code:', code);
    // Set the search term to the scanned code
    this.searchCtrl.setValue(code);

    // Search for stock items using the code via the StockService method
    // This should ideally use a method that returns StockCurrentDto[] directly
    // based on the code, potentially filtered by selectedLocationId.
    // Assuming getCurrentStockByProductCode fits this purpose.
    this.stockService.getCurrentStockByProductCode(code, this.selectedLocationId).subscribe({
      next: (stockItems: StockCurrentDto[]) => { // Explicitly type the data received by next for barcode scan
        console.log('Stock items found by code:', stockItems);
        if (stockItems.length > 0) {
          // Clear any previous search results from text search
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
          this.searchResults = []; // Clear results on error
          this.isSearching = true; // Mark as searching to show the "no results" state in the search section
          this.loading = false; // Stop loading state
          this.cdr.detectChanges(); // Ensure UI updates
          // Show not found message
          this.snack.open('Código no encontrado en inventario', 'Cerrar', {
            duration: 0, // Keep open until user dismisses
            horizontalPosition: 'center',
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
          duration: 0, // Keep open until user dismisses
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  addInventoryEntry(item: StockCurrentDto) {
    // Get current price — fallback to 0 if not available
    //const currentPrice = this.getCurrentPriceForProduct(item.productId) || 0;

    const dialogRef = this.dialog.open(StockEntryModalComponent, {
      width: '500px',
      data: {
        locationId: item.locationId,
        productId: item.productId,
        productName: item.productName,
        attributeSetInstanceId: item.attributeSetInstanceId,
        currentPrice: item.pricebuy ?? 0,
        idSupplier: item.idSupplier ?? null,
        pricesell: item.pricesell ?? 0,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.resetAndReload();
        this.snack.open('Movimiento de inventario registrado', 'Cerrar', { duration: 5000 });
      }
    });
  }

  // Helper: get current price from product (you may need to enhance this)
  private getCurrentPriceForProduct(productId: string): number | null {
    // Option 1: Store product prices in a map during load
    // Option 2: Call CatalogService.getProduct(productId) — but that’s async
    // For now, return 0 as fallback; you can improve this later
    return 0;
  }

}