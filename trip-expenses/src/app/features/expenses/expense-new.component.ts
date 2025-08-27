import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TripsService } from '../../core/trips.service';

@Component({
  selector: 'app-expense-new',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container" *ngIf="trip(); else missing">
      <h2>Nuova Spesa per {{ trip()?.name }}</h2>
      <form [formGroup]="form" (ngSubmit)="create()" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Descrizione</mat-label>
          <input matInput formControlName="description" required />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Importo</mat-label>
          <input matInput type="number" step="0.01" formControlName="amount" required />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Pagata da</mat-label>
          <mat-select formControlName="paidByParticipantId" required>
            <mat-option *ngFor="let p of trip()?.participants" [value]="p.id">{{ p.name }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Divisa tra</mat-label>
          <mat-select formControlName="splitParticipantIds" multiple required>
            <mat-option *ngFor="let p of trip()?.participants" [value]="p.id">{{ p.name }}</mat-option>
          </mat-select>
        </mat-form-field>
        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Aggiungi</button>
        </div>
      </form>
    </div>
    <ng-template #missing><p>Viaggio non trovato.</p></ng-template>
  `,
  styles: [`
    .container { padding: 16px; display: block; }
    .form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .actions { grid-column: 1 / -1; }
  `]
})
export class ExpenseNewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tripsService = inject(TripsService);

  readonly tripId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly trip = computed(() => this.tripsService.getTrip(this.tripId));

  form = this.fb.nonNullable.group({
    description: ['', Validators.required],
    amount: [0, { validators: [Validators.required, Validators.min(0.01)] }],
    paidByParticipantId: ['', Validators.required],
    splitParticipantIds: this.fb.nonNullable.control<string[]>([], { validators: [Validators.required] }),
  });

  create() {
    if (this.form.invalid || !this.tripId) return;
    const { description, amount, paidByParticipantId, splitParticipantIds } = this.form.getRawValue();
    this.tripsService.addExpense(this.tripId, { description, amount, paidByParticipantId, splitParticipantIds });
    this.router.navigate(['/trips', this.tripId]);
  }
}

