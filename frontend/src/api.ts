export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type Subscription = {
  id: number;
  name: string;
  price: number;
  renewalDate: string;
  billingCycle: BillingCycle;
};
export type SubscriptionInput = Omit<Subscription, 'id'>;

const base = '/api/subscriptions';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers }
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data.error || data.detail || data.message || message;
    } catch { /* Keep the status message. */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  list: () => request<Subscription[]>(base),
  summary: () => request<{ monthlyTotal: number }>(`${base}/summary`),
  upcoming: () => request<Subscription[]>(`${base}/upcoming?days=7`),
  create: (input: SubscriptionInput) => request<Subscription>(base, { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, input: SubscriptionInput) => request<Subscription>(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: number) => request<void>(`${base}/${id}`, { method: 'DELETE' })
};
