import { Routes } from '@angular/router';
import { ProductListPaginated } from './shared/components/product-list-paginated/product-list-paginated';
import { StockCurrentList } from './shared/components/stock/stock-current-list/stock-current-list';
import { StockMovementList } from './shared/components/stock/stock-movement-list/stock-movement-list';
import { InventoryValuationReport } from './shared/components/stock/inventory-valuation-report/inventory-valuation-report';

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
  //{ path: 'suppliers', loadComponent: () => import('./shared/components/supplier-manager/supplier-manager/supplier-manager').then(c => c.SupplierManager) },
  { path: 'suppliers', loadComponent: () => import('./shared/components/supplier-list/supplier-list').then(c => c.SupplierList) },
  { path: 'inventory', loadComponent: () => import('./shared/components/stock/stock-current-list/stock-current-list').then(c => c.StockCurrentList) },
  { path: 'inventory/movements', loadComponent: () => import('./shared/components/stock/stock-movement-list/stock-movement-list').then(c => c.StockMovementList) },
  { path: 'inventory/valuation', loadComponent: () => import('./shared/components/stock/inventory-valuation-report/inventory-valuation-report').then(c => c.InventoryValuationReport) },
  { path: 'sales', loadComponent: () => import('./shared/components/sales-closed-pos-report/sales-closed-pos-report').then(c => c.SalesClosedPosReport) },
  { path: '**', redirectTo: '' }   // optional catch-all
];