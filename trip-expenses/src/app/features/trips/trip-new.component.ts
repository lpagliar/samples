import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TripsService } from '../../core/trips.service';

@Component({
  selector: 'app-trip-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <h2>Nuovo Viaggio</h2>
      <form [formGroup]="form" (ngSubmit)="create()" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name" required />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Valuta</mat-label>
          <input matInput formControlName="currency" required placeholder="EUR" />
        </mat-form-field>

        <div class="participants" formArrayName="participants">
          <h3>Partecipanti</h3>
          <div *ngFor="let _ of participants.controls; let i = index" class="row">
            <mat-form-field appearance="outline" class="flex">
              <mat-label>Nome</mat-label>
              <input matInput [formControlName]="i" />
            </mat-form-field>
            <button type="button" mat-icon-button color="warn" (click)="removeParticipant(i)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
          <button type="button" mat-button (click)="addParticipant()">
            <mat-icon>person_add</mat-icon>
            Aggiungi partecipante
          </button>
        </div>

        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Crea</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container { padding: 16px; display: block; }
    .form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .participants { grid-column: 1 / -1; }
    .row { display: flex; align-items: center; gap: 8px; }
    .flex { flex: 1; }
    .actions { grid-column: 1 / -1; }
  `]
})
export class TripNewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tripsService = inject(TripsService);
  private readonly router = inject(Router);

  form = this.fb.group({
    name: ['', Validators.required],
    currency: ['EUR', Validators.required],
    participants: this.fb.array<string>([]),
  });

  get participants() {
    return this.form.controls.participants as FormArray;
  }

  addParticipant() {
    this.participants.push(this.fb.control(''));
  }

  removeParticipant(i: number) {
    this.participants.removeAt(i);
  }

  create() {
    if (this.form.invalid) return;
    const { name, currency, participants } = this.form.getRawValue();
    const participantsModels = participants
      .map(n => n?.trim())
      .filter(n => !!n)
      .map(n => ({ id: crypto.randomUUID(), name: n! }));
    const trip = this.tripsService.createTrip(name!, currency!, participantsModels);
    this.router.navigate(['/trips', trip.id]);
  }
}

