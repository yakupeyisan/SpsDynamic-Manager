import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ClaimDetail {
  Name: string;
  ClaimDesc?: string;
}

export interface PendingClaimItem {
  claim: string;
  description?: string;
  message?: string;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PendingClaimsService {
  private pendingClaimsSubject = new BehaviorSubject<PendingClaimItem[]>([]);
  public pendingClaims$ = this.pendingClaimsSubject.asObservable();

  get pendingClaims(): PendingClaimItem[] {
    return this.pendingClaimsSubject.value;
  }

  get uniqueClaimNames(): string[] {
    const claims = this.pendingClaimsSubject.value.map(c => c.claim);
    return [...new Set(claims)];
  }

  /** Benzersiz claim'leri açıklamalarıyla birlikte döndürür */
  get uniqueClaimsWithDetails(): { claim: string; description?: string }[] {
    const seen = new Set<string>();
    const result: { claim: string; description?: string }[] = [];
    for (const item of this.pendingClaimsSubject.value) {
      if (!seen.has(item.claim)) {
        seen.add(item.claim);
        result.push({ claim: item.claim, description: item.description });
      }
    }
    return result;
  }

  get count(): number {
    return this.uniqueClaimNames.length;
  }

  addClaims(claims: string[], message?: string, claimDetails?: ClaimDetail[]): void {
    console.log('[PendingClaimsService] addClaims called:', { claims, message, claimDetails });
    if (!claims || claims.length === 0) return;
    const existing = this.pendingClaimsSubject.value;
    const existingClaims = new Set(existing.map(c => c.claim));
    const detailsMap = new Map<string, string>();
    if (claimDetails && Array.isArray(claimDetails)) {
      for (const detail of claimDetails) {
        if (detail.Name && detail.ClaimDesc) {
          detailsMap.set(detail.Name, detail.ClaimDesc);
        }
      }
    }
    console.log('[PendingClaimsService] detailsMap:', detailsMap);
    const newItems: PendingClaimItem[] = [];
    for (const claim of claims) {
      if (!existingClaims.has(claim)) {
        newItems.push({
          claim,
          description: detailsMap.get(claim),
          message,
          addedAt: new Date()
        });
        existingClaims.add(claim);
      }
    }
    if (newItems.length > 0) {
      this.pendingClaimsSubject.next([...existing, ...newItems]);
      console.log('[PendingClaimsService] New pending claims:', this.pendingClaimsSubject.value);
    }
  }

  removeClaim(claim: string): void {
    const filtered = this.pendingClaimsSubject.value.filter(c => c.claim !== claim);
    this.pendingClaimsSubject.next(filtered);
  }

  clear(): void {
    this.pendingClaimsSubject.next([]);
  }
}
