export interface Participant {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  dateIso: string; // ISO date string
  paidByParticipantId: string;
  splitParticipantIds: string[]; // participants sharing this expense equally
}

export interface Trip {
  id: string;
  name: string;
  currency: string; // e.g., "EUR", "USD"
  participants: Participant[];
  expenses: Expense[];
  createdAtIso: string;
  updatedAtIso: string;
}

export interface ParticipantBalance {
  participantId: string;
  paidTotal: number;
  owedTotal: number;
  balance: number; // paidTotal - owedTotal
}

export interface TripBalances {
  tripId: string;
  currency: string;
  balances: ParticipantBalance[];
}

export type IdLike = string;

