import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TripsService } from '../../core/trips.service';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatListModule],
  template: `
    <div class="container" *ngIf="trip(); else missing">
      <h2>{{ trip()?.name }}</h2>
      <p>Valuta: {{ trip()?.currency }}</p>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Partecipanti</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item *ngFor="let p of trip()?.participants">
              {{ p.name }}
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Spese</mat-card-title>
          <button mat-button color="primary" routerLink="/trips/{{ tripId() }}/expenses/new">
            <mat-icon>add</mat-icon>
            Aggiungi Spesa
          </button>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item *ngFor="let e of trip()?.expenses">
              <div matListItemTitle>{{ e.description }} — {{ e.amount | number:'1.2-2' }} {{ trip()?.currency }}</div>
              <div matListItemLine>
                Pagata da {{ participantName(e.paidByParticipantId) }} per {{ e.splitParticipantIds.length }} persone
              </div>
            </mat-list-item>
          </mat-list>
          <p *ngIf="(trip()?.expenses?.length ?? 0) === 0">Nessuna spesa.</p>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Bilanci</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item *ngFor="let b of balances()?.balances">
              <div matListItemTitle>{{ participantName(b.participantId) }}</div>
              <div matListItemLine>Ha pagato {{ b.paidTotal | number:'1.2-2' }}; Deve {{ b.owedTotal | number:'1.2-2' }}; Bilancio {{ b.balance | number:'1.2-2' }} {{ balances()?.currency }}</div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>

    <ng-template #missing>
      <p>Viaggio non trovato.</p>
    </ng-template>
  `,
  styles: [`
    .container { padding: 16px; display: grid; gap: 12px; }
    mat-card-header { display: flex; align-items: center; justify-content: space-between; }
  `]
})
export class TripDetailComponent {
  private readonly tripsService = inject(TripsService);
  private readonly route = inject(ActivatedRoute);

  readonly tripId = signal<string>('');
  readonly trip = computed(() => this.tripsService.getTrip(this.tripId()));
  readonly balances = computed(() => this.tripId() ? this.tripsService.calculateBalances(this.tripId()) : undefined);

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      this.tripId.set(id ?? '');
    });
  }

  participantName(id: string): string {
    const p = this.trip()?.participants.find(p => p.id === id);
    return p?.name ?? 'Sconosciuto';
  }
}

