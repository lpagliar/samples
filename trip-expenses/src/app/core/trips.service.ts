import { Injectable, signal } from '@angular/core';
import { Expense, Participant, ParticipantBalance, Trip, TripBalances } from './models';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'trip-expenses.trips.v1';

@Injectable({ providedIn: 'root' })
export class TripsService {
  private readonly tripsSignal = signal<Trip[]>([]);

  public readonly trips = this.tripsSignal.asReadonly();

  constructor(private readonly storage: StorageService) {
    const loaded = this.storage.getItem<Trip[]>(STORAGE_KEY, []);
    this.tripsSignal.set(loaded);
    if (this.tripsSignal().length === 0) {
      this.seedSampleData();
    }
  }

  public save(): void {
    this.storage.setItem(STORAGE_KEY, this.tripsSignal());
  }

  public createTrip(name: string, currency: string, participants: Participant[] = []): Trip {
    const now = new Date().toISOString();
    const trip: Trip = {
      id: crypto.randomUUID(),
      name,
      currency,
      participants: [...participants],
      expenses: [],
      createdAtIso: now,
      updatedAtIso: now,
    };
    this.tripsSignal.update(list => [...list, trip]);
    this.save();
    return trip;
  }

  public updateTrip(tripId: string, updates: Partial<Omit<Trip, 'id' | 'createdAtIso'>>): void {
    this.tripsSignal.update(list => list.map(t => {
      if (t.id !== tripId) return t;
      const updated: Trip = {
        ...t,
        ...updates,
        updatedAtIso: new Date().toISOString(),
      } as Trip;
      return updated;
    }));
    this.save();
  }

  public deleteTrip(tripId: string): void {
    this.tripsSignal.update(list => list.filter(t => t.id !== tripId));
    this.save();
  }

  public addParticipant(tripId: string, name: string): Participant {
    const participant: Participant = { id: crypto.randomUUID(), name };
    this.tripsSignal.update(list => list.map(t => t.id === tripId ? {
      ...t,
      participants: [...t.participants, participant],
      updatedAtIso: new Date().toISOString(),
    } : t));
    this.save();
    return participant;
  }

  public removeParticipant(tripId: string, participantId: string): void {
    this.tripsSignal.update(list => list.map(t => t.id === tripId ? {
      ...t,
      participants: t.participants.filter(p => p.id !== participantId),
      expenses: t.expenses.map(e => ({
        ...e,
        splitParticipantIds: e.splitParticipantIds.filter(id => id !== participantId),
      })).filter(e => e.splitParticipantIds.length > 0),
      updatedAtIso: new Date().toISOString(),
    } : t));
    this.save();
  }

  public addExpense(tripId: string, expense: Omit<Expense, 'id' | 'tripId' | 'dateIso'> & { dateIso?: string }): Expense {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      tripId,
      description: expense.description,
      amount: expense.amount,
      dateIso: expense.dateIso ?? new Date().toISOString(),
      paidByParticipantId: expense.paidByParticipantId,
      splitParticipantIds: [...expense.splitParticipantIds],
    };
    this.tripsSignal.update(list => list.map(t => t.id === tripId ? {
      ...t,
      expenses: [newExpense, ...t.expenses],
      updatedAtIso: new Date().toISOString(),
    } : t));
    this.save();
    return newExpense;
  }

  public removeExpense(tripId: string, expenseId: string): void {
    this.tripsSignal.update(list => list.map(t => t.id === tripId ? {
      ...t,
      expenses: t.expenses.filter(e => e.id !== expenseId),
      updatedAtIso: new Date().toISOString(),
    } : t));
    this.save();
  }

  public getTrip(tripId: string): Trip | undefined {
    return this.tripsSignal().find(t => t.id === tripId);
  }

  public calculateBalances(tripId: string): TripBalances | undefined {
    const trip = this.getTrip(tripId);
    if (!trip) return undefined;

    const paidTotals = new Map<string, number>();
    const owedTotals = new Map<string, number>();
    for (const p of trip.participants) {
      paidTotals.set(p.id, 0);
      owedTotals.set(p.id, 0);
    }

    for (const e of trip.expenses) {
      const numSharers = Math.max(1, e.splitParticipantIds.length);
      const share = e.amount / numSharers;
      paidTotals.set(e.paidByParticipantId, (paidTotals.get(e.paidByParticipantId) ?? 0) + e.amount);
      for (const pid of e.splitParticipantIds) {
        owedTotals.set(pid, (owedTotals.get(pid) ?? 0) + share);
      }
    }

    const balances: ParticipantBalance[] = trip.participants.map(p => {
      const paidTotal = round2(paidTotals.get(p.id) ?? 0);
      const owedTotal = round2(owedTotals.get(p.id) ?? 0);
      const balance = round2(paidTotal - owedTotal);
      return { participantId: p.id, paidTotal, owedTotal, balance };
    });

    return { tripId: trip.id, currency: trip.currency, balances };
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Sample data to help first-time users
// Only called when storage is empty
// Creates one trip with two participants and two expenses
// Users can delete or modify later
// This runs once and persists via localStorage
export interface _SeedParticipant { id: string; name: string }
export interface _SeedExpense { description: string; amount: number; paidByParticipantId: string; splitParticipantIds: string[]; dateIso?: string }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _neverUsedJustTypes(_p?: _SeedParticipant, _e?: _SeedExpense) { /* types only */ }

// Extend the service via declaration merging
declare module './trips.service' { interface TripsService { seedSampleData(): void } }

TripsService.prototype.seedSampleData = function(this: TripsService): void {
  const alice = { id: crypto.randomUUID(), name: 'Alice' };
  const bob = { id: crypto.randomUUID(), name: 'Bob' };
  const trip = this.createTrip('Weekend a Roma', 'EUR', [alice, bob]);
  this.addExpense(trip.id, {
    description: 'Caffè',
    amount: 4,
    paidByParticipantId: alice.id,
    splitParticipantIds: [alice.id, bob.id],
  });
  this.addExpense(trip.id, {
    description: 'Taxi',
    amount: 24,
    paidByParticipantId: bob.id,
    splitParticipantIds: [alice.id, bob.id],
  });
};

