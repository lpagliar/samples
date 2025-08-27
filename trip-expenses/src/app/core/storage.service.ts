import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage: Storage = window.localStorage;

  public getItem<T>(key: string, fallback: T): T {
    try {
      const raw = this.storage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  public setItem<T>(key: string, value: T): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  public removeItem(key: string): void {
    this.storage.removeItem(key);
  }
}

