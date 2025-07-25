import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { CatalogService } from '../../services/catalog';
import { Category } from '../../models/category.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButton, MatCardModule,
    MatIconModule
  ],
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.scss']
})
export class CategoryList implements OnInit {
  categories: Category[] = [];
  constructor(private svc: CatalogService) { }
  ngOnInit() { this.svc.listCategories().subscribe(list => this.categories = list); }
}