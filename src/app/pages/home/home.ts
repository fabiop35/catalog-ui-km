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
    { title: 'Productos', icon: 'shopping_bag', link: '/products', color: '#3f51b5', desc: 'Administre los items del catalogo & sus precios' },
    { title: 'Ventas', icon: 'attach_money', link: '/sales', color: '#43b53fff', desc: 'Ventas, Cierres, Transacciones, Informes' },
    { title: 'Inventarios', icon: 'factory', link: '/inventory', color: '#afaf4cff', desc: 'Administra los niveles de stock y movimientos' },
    { title: 'Proveedores', icon: 'business', link: '/suppliers', color: '#9c27b0', desc: 'Gestione proveedores y contactos' },
    { title: 'Categorias', icon: 'category', link: '/categories', color: 'rgba(97, 100, 100, 1)', desc: 'Organice los productos por categorias' },
    { title: 'Categorias de Impuestos', icon: 'receipt', link: '/tax-categories', color: '#75c0f6ff', desc: 'Defina IVA / Tipos de impuestos' },
    { title: 'Impuestos', icon: 'paid', link: '/taxes', color: '#e91e63', desc: 'Cree & maneje las tasas de impuestos' },
 ];
}