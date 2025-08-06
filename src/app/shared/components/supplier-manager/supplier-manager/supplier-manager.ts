import { Component, OnInit, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { merge, Observable, of } from 'rxjs';
import { startWith, switchMap, catchError, map, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

import { SupplierDialog } from '../supplier-dialog/supplier-dialog';
import { Supplier } from '../../../models/supplier.model';
import { CatalogService } from '../../../services/catalog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-supplier-manager',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './supplier-manager.html',
  styleUrl: './supplier-manager.scss'
})
export class SupplierManager implements AfterViewInit, OnInit {

  displayedColumns: string[] = ['searchkey', 'name', 'taxid', 'email', 'phone', 'maxdebt', 'actions'];
  dataSource = new MatTableDataSource<Supplier>();

  resultsLength = 0;
  isLoadingResults = true;

  //Properties for the autocomplete search functionality
  searchControl = new FormControl('');
  filteredSuppliers$: Observable<Supplier[]>;
  isSearchActive = false;

  debugSearchResults: Supplier[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private supplierService: CatalogService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.filteredSuppliers$ = new Observable<Supplier[]>();
  }

  ngOnInit() {
    this.filteredSuppliers$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.supplierService.searchSuppliers(value || '')),

      //DEBUGGING: Use tap to log results without affecting the stream
      tap((suppliers: Supplier[]) => {
        console.log('API returned:', suppliers);
        this.debugSearchResults = suppliers;
      })
    );
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          //If a search is active, don't fetch paginated data
          if (this.isSearchActive) {
            return of(null);
          }
          this.isLoadingResults = true;
          return this.supplierService.getSuppliers(
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.sort.active
          ).pipe(catchError(() => of(null)));
        }),
        map(data => {
          this.isLoadingResults = false;
          if (data === null) {
            return this.isSearchActive ? this.dataSource.data : [];
          }
          this.resultsLength = data.totalElements;
          return data.content;
        })
      )
      .subscribe(data => (this.dataSource.data = data));
  }

  reloadData() {
    this.paginator.page.emit();
  }

  //Function to handle selection from autocomplete
  onSupplierSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedSearchkey: string = event.option.value;

    //Use the debugSearchResults to find the full Supplier object
    const selectedSupplier = this.debugSearchResults.find(s => s.searchkey === selectedSearchkey);
    if (selectedSupplier) {
      this.dataSource.data = [selectedSupplier];
      this.isSearchActive = true;
      this.resultsLength = 1;
    }
  }

  //Function to display the supplier's searchkey in the input field
  displayFn(supplier: Supplier | string): string {
    if (typeof supplier === 'string') {
      return supplier;
    }
    return supplier && supplier.searchkey ? supplier.searchkey : '';
  }

  //Function to clear the search and reload the paginated table
  clearSearch(): void {
    this.searchControl.setValue('');
    this.isSearchActive = false;
    this.reloadData();
    this.debugSearchResults = [];
  }

  openDialog(supplier?: Supplier): void {
    const dialogRef = this.dialog.open(SupplierDialog, {
      width: '600px',
      data: { supplier }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const operation = supplier
          ? this.supplierService.updateSupplier(supplier.id, { ...supplier, ...result })
          : this.supplierService.createSupplier(result);

        operation.subscribe({
          next: () => {
            this.snackBar.open(`Supplier ${supplier ? 'updated' : 'created'} successfully!`, 'Close', { duration: 3000 });
            this.reloadData();
          },
          error: (err) => this.snackBar.open(err.error?.message || 'An error occurred.', 'Close', { duration: 3000 })
        });
      }
    });
  }

  deleteSupplier(id: string): void {
    if (confirm('¿Está seguro de eliminar este proveedor?')) {
      this.supplierService.deleteSupplier(id).subscribe({
        next: () => {
          this.snackBar.open('Proveedor eliminado correctamente!', 'Close', { duration: 3000 });
          this.reloadData();
        },
        error: (err) => this.snackBar.open(err.error?.message || 'An error occurred.', 'Close', { duration: 3000 })
      });
    }
  }



}
