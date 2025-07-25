import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  cards = [
    { title: 'Products', icon: 'shopping_bag', link: '/products', color: '#3f51b5', desc: 'Manage catalog items & prices' },
    { title: 'Categories', icon: 'category', link: '/categories', color: '#ff9800', desc: 'Organize products by category' },
    { title: 'Tax Categories', icon: 'receipt', link: '/tax-categories', color: '#4caf50', desc: 'Define VAT / sales-tax types' },
    { title: 'Taxes', icon: 'paid', link: '/taxes', color: '#e91e63', desc: 'Create & maintain tax rates' }
  ];
}