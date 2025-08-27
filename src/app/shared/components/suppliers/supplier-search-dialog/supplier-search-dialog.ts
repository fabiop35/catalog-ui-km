import { CommonModule, NgIf, NgForOf } from '@angular/common'; // 👈 Import these
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { Supplier } from '../../../models/supplier.model';
import { CatalogService } from '../../../services/catalog';
import { MatInputModule } from "@angular/material/input";


@Component({
  template: `
    <h2 mat-dialog-title>Buscar Proveedor</h2>
    <mat-dialog-content class="dialog-content">
      <mat-form-field appearance="outline" class="full-width">
        <input
          matInput
          placeholder="Buscar por nombre..."
          #searchInput
          (input)="searchSuppliers(searchInput.value)"
        />
      </mat-form-field>

      <div class="results-container" *ngIf="results.length > 0; else noResults">
        <div
          class="supplier-item"
          *ngFor="let s of results"
          (click)="selectSupplier(s)"
        >
          <h4>{{ s.name }}</h4>
          <p><strong>Clave:</strong> {{ s.searchkey }}</p>
          <p *ngIf="s.email"><strong>Email:</strong> {{ s.email }}</p>
          <p *ngIf="s.phone"><strong>Teléfono:</strong> {{ s.phone }}</p>
          <p *ngIf="s.city || s.country">
            <strong>Ubicación:</strong> {{ s.city }}, {{ s.country }}
          </p>
        </div>
      </div>

      <ng-template #noResults>
        <p class="no-results">No se encontraron proveedores.</p>
      </ng-template>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      max-height: 70vh;
      display: flex;
      flex-direction: column;
    }

    .full-width {
      width: 100%;
    }

    .results-container {
      margin-top: 16px;
      max-height: 40vh;
      overflow-y: auto;
    }

    .supplier-item {
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      background: white;
      transition: background 0.2s;
    }

    .supplier-item:hover {
      background: #f5f5f5;
      border-color: #283593;
    }

    .supplier-item h4 {
      margin: 0 0 4px 0;
      color: #1a237e;
      font-size: 1.05rem;
    }

    .supplier-item p {
      margin: 4px 0;
      font-size: 0.9rem;
      color: #555;
    }

    .no-results {
      text-align: center;
      color: #999;
      font-style: italic;
    }
  `],
  imports: [MatDialogActions, MatDialogModule, MatInputModule, CommonModule, NgIf, NgForOf,]
})
export class SupplierSearchDialog {
  results: Supplier[] = [];

  constructor(
    private svc: CatalogService,
    private dialogRef: MatDialogRef<SupplierSearchDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { selectedId?: string }
  ) {
    this.loadAllSuppliers();
  }

  loadAllSuppliers() {
    this.svc.getSuppliers(0, 50, 'name').subscribe(page => {
      this.results = page.content;
    });
  }

  searchSuppliers(term: string) {
    if (!term.trim()) {
      this.loadAllSuppliers();
      return;
    }

    // Simple client-side filter (you can improve with backend search later)
    this.svc.getSuppliers(0, 50, 'name').subscribe(page => {
      this.results = page.content.filter(s =>
        s.name.toLowerCase().includes(term.toLowerCase())
      );
    });
  }

  selectSupplier(supplier: Supplier) {
    this.dialogRef.close(supplier);
  }
}