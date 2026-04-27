import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string =>
  `MK ${amount.toLocaleString('en-MW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (iso: string): string => {
  try { return format(parseISO(iso), 'dd MMM yyyy'); }
  catch { return iso; }
};

export const formatDateTime = (iso: string): string => {
  try { return format(parseISO(iso), 'dd MMM yyyy, h:mm a'); }
  catch { return iso; }
};

export const generateId = (): string => crypto.randomUUID();

export const generateOrderNumber = (existingCount: number): string => {
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(3, '0');
  return `ORD-${year}-${seq}`;
};

export const derivePaymentStatus = (total: number, paid: number) => {
  if (paid <= 0) return 'Unpaid' as const;
  if (paid >= total) return 'Paid' as const;
  return 'Partial' as const;
};
