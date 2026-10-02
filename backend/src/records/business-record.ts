export const STATUSES = {
  customers: ['Active', 'Lead', 'Inactive'],
  deals: ['Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'],
  invoices: ['Draft', 'Sent', 'Paid', 'Overdue'],
  products: ['In stock', 'Low stock', 'Out of stock'],
  tasks: ['To do', 'In progress', 'Done'],
} as const;

export type RecordType = keyof typeof STATUSES;

export interface RecordInput {
  type: RecordType;
  name: string;
  company: string;
  email: string | null;
  status: string;
  amount: number;
  date: string;
  owner: string;
  quantity: number;
  notes: string | null;
}

export interface BusinessRecord extends RecordInput {
  id: number;
}
