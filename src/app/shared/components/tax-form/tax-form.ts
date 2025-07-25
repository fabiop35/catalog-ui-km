import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CatalogService } from '../../services/catalog';
import { Tax } from '../../models/tax.model';
import { MatInputModule } from '@angular/material/input';
import { MatToolbar } from "@angular/material/toolbar";

@Component({
  selector: 'app-tax-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatToolbar],
  templateUrl: './tax-form.html',
  styleUrls: ['./tax-form.scss']
})
export class TaxForm {
  form = new FormGroup({
    name: new FormControl(''),
    categoryId: new FormControl(''),
    rate: new FormControl(0)
  });
  constructor(private svc: CatalogService, private snack: MatSnackBar) { }
  onSubmit() {
    if (!this.form.valid) return;
    const t = this.form.value as Tax;
    this.svc.createTax(t).subscribe(() => {
      this.snack.open('Tax created', 'Close', { duration: 3000 });
      this.form.reset();
    });
  }
}