import { Routes } from '@angular/router';
import { TripsListComponent } from './features/trips/trips-list.component';
import { TripNewComponent } from './features/trips/trip-new.component';
import { TripDetailComponent } from './features/trips/trip-detail.component';
import { ExpenseNewComponent } from './features/expenses/expense-new.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'trips' },
  { path: 'trips', component: TripsListComponent },
  { path: 'trips/new', component: TripNewComponent },
  { path: 'trips/:id', component: TripDetailComponent },
  { path: 'trips/:id/expenses/new', component: ExpenseNewComponent },
];
