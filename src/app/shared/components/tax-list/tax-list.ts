import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CatalogService } from '../../services/catalog';
import { Tax } from '../../models/tax.model';


@Component({
  selector: 'app-tax-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './tax-list.html',
  styleUrls: ['./tax-list.scss']
})
export class TaxList implements OnInit {
  taxes: Tax[] = [];
  constructor(private svc: CatalogService) { }
  ngOnInit() { this.svc.listTaxes().subscribe(list => this.taxes = list); }
}