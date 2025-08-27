import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TripsService } from '../../core/trips.service';

@Component({
  selector: 'app-trips-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <h2>Viaggi</h2>
      <button mat-raised-button color="primary" routerLink="/trips/new">
        <mat-icon>add</mat-icon>
        Nuovo Viaggio
      </button>
      <mat-nav-list>
        <a mat-list-item *ngFor="let t of trips" [routerLink]="['/trips', t.id]">
          <span matListItemTitle>{{ t.name }}</span>
          <span matListItemLine>{{ t.currency }} • {{ t.participants.length }} partecipanti • {{ t.expenses.length }} spese</span>
        </a>
      </mat-nav-list>
      <p *ngIf="trips.length === 0">Nessun viaggio. Crea il primo!</p>
    </div>
  `,
  styles: [`
    .container { padding: 16px; display: block; }
    h2 { margin: 0 0 12px 0; }
    button { margin-bottom: 12px; }
  `]
})
export class TripsListComponent implements OnInit {
  private readonly tripsService = inject(TripsService);
  trips = this.tripsService.trips();

  ngOnInit(): void {
    // noop
  }
}

