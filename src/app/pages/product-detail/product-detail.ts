import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CatalogService } from '../../shared/services/catalog';
import { ProductWithCategoryDto } from '../../shared/models/product-with-category.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="product; else loading">
      <h2>{{ product.name }}</h2>
      <p>Ref: {{ product.reference }}</p>
      <p>Price: {{ product.pricesell | currency }}</p>
      <p>Category: {{ product.categoryName }}</p>
    </div>
    <ng-template #loading>Loading…</ng-template>
  `
})
export class ProductDetailComponent implements OnInit {
  product?: ProductWithCategoryDto;

  constructor(private route: ActivatedRoute, private svc: CatalogService) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getProduct(id).subscribe(p => this.product = p);
  }
}