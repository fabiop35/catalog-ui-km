import { Routes } from '@angular/router';
import { ProductListPaginated } from './shared/components/product-list-paginated/product-list-paginated';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(c => c.HomeComponent) },
  //{ path: 'products', loadComponent: () => import('./pages/product-list/product-list').then(m => m.ProductList) },
  //{ path: 'products', loadComponent: () => import('./shared/components/product-panel/product-panel').then(m => m.ProductPanel) },
  { path: 'products', component: ProductListPaginated },
  { path: 'products/new', loadComponent: () => import('./shared/components/product-form/product-form').then(m => m.ProductForm) },
  { path: 'products/:id', loadComponent: () => import('./pages/product-detail/product-detail').then(c => c.ProductDetailComponent) },
  { path: 'products/:id/edit', loadComponent: () => import('./shared/components/product-form-edit/product-form-edit').then(c => c.ProductFormEdit) },
  { path: 'categories', loadComponent: () => import('./shared/components/category-list/category-list').then(c => c.CategoryList) },
  { path: 'categories/new', loadComponent: () => import('./shared/components/category-form/category-form').then(c => c.CategoryForm) },
  { path: 'tax-categories', loadComponent: () => import('./shared/components/tax-category-list/tax-category-list').then(m => m.TaxCategoryList) },
  { path: 'tax-categories/new', loadComponent: () => import('./shared/components/tax-category-form/tax-category-form').then(c => c.TaxCategoryForm) },
  { path: 'taxes', loadComponent: () => import('./shared/components/tax-list/tax-list').then(c => c.TaxList) },
  { path: 'taxes/new', loadComponent: () => import('./shared/components/tax-form/tax-form').then(c => c.TaxForm) },
  { path: '**', redirectTo: '' }   // optional catch-all
];