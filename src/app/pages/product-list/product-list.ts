import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../shared/services/catalog';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, RouterLink  ],
  templateUrl: './product-list.html'
})
export class ProductList implements OnInit {
  displayedColumns: string[] = ['name', 'priceSell', 'categoryName', 'actions'];
  products: any[] = [];

  constructor(private service: CatalogService, private router: Router) { }

  ngOnInit() {
    this.service.listProducts().subscribe(data => this.products = data);
  }

  add() { this.router.navigate(['/products/new']); }
}