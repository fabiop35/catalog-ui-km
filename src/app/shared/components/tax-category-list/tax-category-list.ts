import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { CatalogService } from '../../services/catalog';
import { TaxCategory } from '../../models/tax-category.model';


@Component({
  selector: 'app-tax-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './tax-category-list.html',
  styleUrls: ['./tax-category-list.scss']
})
export class TaxCategoryList implements OnInit {
  taxCategories: TaxCategory[] = [];
  constructor(private svc: CatalogService) { }
  ngOnInit() { this.svc.listTaxCategories().subscribe(list => this.taxCategories = list); }
}