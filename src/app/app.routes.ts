import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', loadComponent: () => import('./pages/product-list/product-list').then(m => m.ProductList) },
  { path: 'products/new', loadComponent: () => import('./pages/product-form/product-form').then(m => m.ProductForm) },
  { path: 'categories', loadComponent: () => import('./pages/category-list/category-list').then(m => m.CategoryList) },
  { path: 'tax-categories', loadComponent: () => import('./pages/tax-category-list/tax-category-list').then(m => m.TaxCategoryList) },
  { path: 'taxes', loadComponent: () => import('./pages/tax-list/tax-list').then(m => m.TaxList) },
  { path: 'products/:id', loadComponent: () => import('./pages/product-detail/product-detail').then(c => c.ProductDetailComponent) }
];