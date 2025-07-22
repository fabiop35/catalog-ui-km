#GUI for Unicenta POS

$ npm i -g @angular/cli
$ ng new catalog-ui-km --routing=true --style=scss --standalone
$ cd catalog-ui
$ ng serve -o
$ ng add @angular/material

#Generate shared folder & interfaces
$ ng g interface shared/models/product --type=model --standalone
$ ng g interface shared/models/category --type=model --standalone
$ ng g interface shared/models/tax-category --type=model --standalone
$ ng g interface shared/models/tax --type=model --standalone

#HTTP service
$ ng g s shared/services/catalog --standalone

#Generate pages / components - Product list + create
$ ng g component pages/product-list --standalone --skip-tests
$ ng g component pages/product-form --standalone --skip-tests

#Supporting components (optional)
$ ng g component pages/category-list --standalone --skip-tests
$ ng g component pages/tax-category-list --standalone --skip-tests
$ ng g component pages/tax-list --standalone --skip-tests

# Run the client
$ ng serve

#product-detail.component.ts
$ ng g component pages/product-detail --standalone --skip-tests

#Quick test
$ curl http://localhost:8080/api/v1/products/f1e2d3c4-b5a6-7890-1234-567890abcdef

# Angular component (stand-alone) 
ng g component pages/product-detail --standalone --skip-tests

#Install Angular Material
$ ng add @angular/material

#Product Panel Component
$ ng g component shared/components/product-panel --standalone --skip-tests

#Category / Tax-Category / Tax Panels. Each panel is a stand-alone component with identical structure
$ ng g component shared/components/category-panel --standalone --skip-tests
$ ng g component shared/components/tax-category-panel --standalone --skip-tests
$ ng g component shared/components/tax-panel --standalone --skip-tests

#Product-Grid component
$ ng g component shared/components/product-grid --standalone --skip-tests


































