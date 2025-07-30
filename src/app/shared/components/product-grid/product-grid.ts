import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ProductWithCategoryDto } from '../../models/product-with-category.model';
import { InlineProductEdit } from "../inline-product-edit/inline-product-edit";
import { CatalogService } from '../../services/catalog';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    InlineProductEdit
  ],
  templateUrl: './product-grid.html',
  styleUrls: ['./product-grid.scss']
})
export class ProductGrid {

  updatedId?: string;
  @Input() products: ProductWithCategoryDto[] = [];
  singleProduct: any;
  editing: Record<string, boolean> = {};

  constructor(private service: CatalogService) { }

  trackById(index: number, item: ProductWithCategoryDto): string {
    return item.id || '';
  }

  openEdit(product: ProductWithCategoryDto) {
    this.editing[product.id!] = true;
  }

  closeEdit(id: string) {
    this.editing[id] = false;
    // optional re-fetch list
  }

  /*onProductUpdated() {
    // simplest: reload list
    this.service.listProducts().subscribe(list => this.products = list);
  }*/
  /*onProductUpdated(updated: ProductWithCategoryDto) {
    const idx = this.products.findIndex(p => p.id === updated.id);
    if (idx >= 0) this.products[idx] = { ...updated };
  }*/

  /*onProductUpdated() {
    // simplest: full reload
    this.service.listProducts().subscribe(list => {
      this.products = list;
      this.editing = {};          // close all inline edits
    });
  }*/

  /*onProductUpdated(updated: ProductWithCategoryDto) {
    // replace in array
    const idx = this.products.findIndex(p => p.id === updated.id);
    if (idx >= 0) this.products[idx] = { ...updated };

    // highlight
    this.updatedId = updated.id;
    setTimeout(() => (this.updatedId = undefined), 3000);
  }*/

    onProductUpdated(id: string) {
  this.service.listProducts().subscribe(list => {
    this.products = list;
    this.editing = {};                      // close inline
    this.updatedId = id;                    // mark card
    setTimeout(() => (this.updatedId = undefined), 3000);
  });
}

}