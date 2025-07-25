import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { CatalogService } from '../../services/catalog';
import { ProductWithCategoryDto } from '../../models/product-with-category.model';
import { ProductGrid } from "../product-grid/product-grid";

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButton, ProductGrid],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss']
})
export class ProductListComponent implements OnInit {
  products: ProductWithCategoryDto[] = [];

  constructor(private svc: CatalogService) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc.listProducts().subscribe(list => {
      this.products = list;
    });
  }
}