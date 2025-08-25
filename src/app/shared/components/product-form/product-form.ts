import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";

import { CatalogService } from '../../services/catalog';
import { ProductWithCategoryDto } from '../../models/product-with-category.model';
import { Dialog } from '../dialog/dialog';
import { Category } from '../../models/category.model';
import { TaxCategory } from '../../models/tax-category.model';
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner';
import { Tax } from '../../models/tax.model';


@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatToolbarModule,
    BarcodeScanner,
    MatIconModule
  ],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.scss']
})
export class ProductForm implements OnInit, AfterViewInit, OnDestroy {

  categories: Category[] = [];
  taxCategories: TaxCategory[] = [];
  taxes: Tax[] = [];

  @Input() product?: ProductWithCategoryDto;
  @Output() saved = new EventEmitter<ProductWithCategoryDto>();

  @ViewChild('formContent') formContent!: ElementRef;
  private keyboardObserver: any;
  private isKeyboardVisible = false;
  private lastScrollPosition = 0;
  private fieldOffset = 0;

  /* ---------- FORM ---------- */
  form = new FormGroup({
    reference: new FormControl(''),
    code: new FormControl(''),
    codetype: new FormControl('EAN-13'),
    name: new FormControl(''),
    //display: new FormControl(''),
    pricesell: new FormControl(0),
    pricebuy: new FormControl(0),
    categoryId: new FormControl(''),
    taxcatId: new FormControl('')
  });

  rrp: number = 0;
  margin: number = 0;
  markup: number = 0;

  constructor(
    private svc: CatalogService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private dialogRef?: MatDialogRef<ProductForm>,
    @Inject(MAT_DIALOG_DATA) public data?: ProductWithCategoryDto
  ) { }

  ngOnInit() {
    this.svc.listCategories().subscribe(list => {
      this.categories = list;
      // pre-select first category
      if (!this.product) this.form.patchValue({ categoryId: list[0]?.id });
    });

    this.svc.listTaxCategories().subscribe(list => {
      this.taxCategories = list;
      if (!this.product) this.form.patchValue({ taxcatId: list[0]?.id });
    });

    this.svc.listTaxes().subscribe(list => {
      this.taxes = list;
    });


    // Get the next reference when form is initialized (only for new products)
    if (!this.product) {
      this.getNextProductReference();
    }

    // 🔔 Watch for changes in pricesell and taxcatId
    this.form.get('pricesell')?.valueChanges.subscribe(() => this.calculateRrp());
    this.form.get('taxcatId')?.valueChanges.subscribe(() => this.calculateRrp());

    // Initial calculation (in case defaults are set)
    this.calculateRrp();


    // 🔔 Watch for changes in pricebuy and pricesell for margin
    const priceSellControl = this.form.get('pricesell');
    const priceBuyControl = this.form.get('pricebuy');
    // Subscribe to changes
    priceSellControl?.valueChanges.subscribe(() => this.calculateMetrics());
    priceBuyControl?.valueChanges.subscribe(() => this.calculateMetrics());
    // Initial calculation
    this.calculateMetrics();

  }

  private getNextProductReference() {
    this.svc.getNextProductReference().subscribe({
      next: (response: { reference: string }) => {
        this.form.patchValue({ reference: response.reference }); // ✅ Extract the string
      },
      error: (error) => {
        console.error('Error getting next reference:', error);
        this.form.patchValue({ reference: 'REF-0001' });
      }
    });
  }

  onSubmit() {
    if (!this.form.valid) return;

    const payload: ProductWithCategoryDto = {
      //id: this.product?.id ?? crypto.randomUUID(), // new UUID for POST
      reference: this.form.value.reference!,
      code: this.form.value.code!,
      codetype: this.form.value.codetype!,
      name: this.form.value.name!,
      pricesell: this.form.value.pricesell!,
      pricebuy: this.form.value.pricebuy!,
      currency: 'USD',
      categoryId: this.form.value.categoryId!,
      taxcatId: this.form.value.taxcatId!
      //display: this.form.value.display || ''
    };

    const obs = this.product?.id
      ? this.svc.updateProduct(this.product.id, payload)
      : this.svc.createProduct(payload);

    obs.subscribe({
      next: (p) => {
        this.snack.open(
          this.product ? 'Product updated ✔️' : 'Product created ✔️',
          'Close',
          { duration: 3000 }
        );
        this.saved.emit(p);          // parent receives the saved product
        this.form.reset();
        this.dialogRef?.close(p);    // close dialog if opened
      },
      error: () =>
        this.snack.open('Error saving', 'Close', { duration: 3000 })
    });
  }

  onCancel() {
    this.form.reset();
    this.dialogRef?.close();                // if inside dialog
    this.saved.emit();                      // or signal parent
  }

  openBarcodeScanner() {
    const dialogRef = this.dialog.open(BarcodeScanner, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      autoFocus: false
    });

    dialogRef.componentInstance.codeScanned.subscribe(code => {
      this.form.get('code')?.setValue(code);
      dialogRef.close();
    });
  }

  ngAfterViewInit() {
    this.setupKeyboardHandling();
  }

  ngOnDestroy() {
    this.cleanupKeyboardHandling();
  }

  private setupKeyboardHandling() {
    // 1. Modern approach using Visual Viewport API (Chrome/Edge)
    if ('visualViewport' in window) {
      const viewport = (window as any).visualViewport;

      viewport.addEventListener('resize', () => {
        this.adjustForKeyboard(viewport);
      });

      viewport.addEventListener('scroll', () => {
        if (this.isKeyboardVisible) {
          this.ensureFieldVisible();
        }
      });
    }
    // 2. Fallback for Safari/iOS
    else {
      this.keyboardObserver = {
        connect: () => {
          window.addEventListener('resize', this.handleWindowResize.bind(this));
        },
        disconnect: () => {
          window.removeEventListener('resize', this.handleWindowResize.bind(this));
        }
      };
      this.keyboardObserver.connect();
    }
  }

  private cleanupKeyboardHandling() {
    if (this.keyboardObserver?.disconnect) {
      this.keyboardObserver.disconnect();
    }
  }

  private handleWindowResize() {
    // On iOS, keyboard resize events are unreliable
    setTimeout(() => {
      const viewportHeight = window.innerHeight;
      const keyboardThreshold = 300; // Approx keyboard height

      if (viewportHeight < window.screen.height * 0.7) {
        this.isKeyboardVisible = true;
        this.ensureFieldVisible();
      } else {
        this.isKeyboardVisible = false;
      }
    }, 100);
  }

  private adjustForKeyboard(viewport: any) {
    const keyboardHeight = window.innerHeight - viewport.height;
    this.isKeyboardVisible = keyboardHeight > 100; // Threshold for keyboard

    if (this.isKeyboardVisible) {
      // Save current scroll position
      this.lastScrollPosition = this.formContent.nativeElement.scrollTop;

      // Ensure focused field is visible
      setTimeout(() => this.ensureFieldVisible(), 100);
    }
  }

  private ensureFieldVisible() {
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement || !this.formContent) return;

    const fieldRect = activeElement.getBoundingClientRect();
    const containerRect = this.formContent.nativeElement.getBoundingClientRect();

    // Calculate how much the field is hidden by keyboard
    const hiddenBottom = fieldRect.bottom - containerRect.bottom + 20;

    if (hiddenBottom > 0) {
      // Scroll to make field visible above keyboard
      this.formContent.nativeElement.scrollTop += hiddenBottom;
      this.fieldOffset = hiddenBottom;
    } else if (this.fieldOffset > 0) {
      // Reset if we scrolled too far
      this.formContent.nativeElement.scrollTop -= this.fieldOffset;
      this.fieldOffset = 0;
    }
  }

  private calculateRrp() {
    const priceSell = this.form.get('pricesell')?.value || 0;
    const taxCatId = this.form.get('taxcatId')?.value;

    const tax = this.taxes.find(tc => tc.taxcatId === taxCatId);
    const taxRate = tax?.rate || 0;

    this.rrp = priceSell * (1 + taxRate);
  }

  private calculateMetrics() {
    const priceSell = this.form.get('pricesell')?.value || 0;
    const priceBuy = this.form.get('pricebuy')?.value || 0;

    // 🔹 Calculate Markup: based on cost (pricebuy)
    if (priceBuy > 0) {
      this.markup = ((priceSell - priceBuy) / priceBuy) * 100;
    } else {
      this.markup = 0;
    }

    // 🔹 Calculate Margin: based on selling price (pricesell)
    if (priceSell > 0) {
      this.margin = ((priceSell - priceBuy) / priceSell) * 100;
    } else {
      this.margin = 0;
    }

    // 🔁 Also recalculate RRP
    this.calculateRrp();
  }
}








