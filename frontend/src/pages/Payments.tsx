import { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDateTime } from '../utils';
import { PageHeader, Card, EmptyState, Badge, KpiTile, FilterChip } from '../components/UI';
import { CreditCard } from 'lucide-react';

export default function Payments() {
  const { payments, customers, orders } = useStore();
  const [methodFilter, setMethodFilter] = useState('All');

  const getCustomer = (id: string) => customers.find(c => c.id === id);
  const getOrder = (id: string) => orders.find(o => o.id === id);

  const filtered = [...payments]
    .filter(p => methodFilter === 'All' || p.method === methodFilter)
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));

  const totalThisMonth = payments
    .filter(p => p.paidAt.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, p) => s + p.amount, 0);

  const methods = ['All', 'Cash', 'Airtel Money', 'TNM Mpamba', 'Other'];
  const totalAllTime = payments.reduce((s, p) => s + p.amount, 0);
  const uniqueCustomers = new Set(filtered.map(p => p.customerId)).size;

  return (
    <div className="fade-in">
      <PageHeader title="Payments" icon={<CreditCard size={18} />} subtitle="All recorded payments" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <KpiTile label="Collected This Month" value={formatCurrency(totalThisMonth)} tone="success" />
        <KpiTile label="Collected (All Time)" value={formatCurrency(totalAllTime)} tone="primary" />
        <KpiTile label="Paying Customers" value={uniqueCustomers} tone="accent" helper={`Filtered by ${methodFilter}`} />
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {methods.map(m => (
          <FilterChip
            key={m}
            label={m}
            active={methodFilter === m}
            onClick={() => setMethodFilter(m)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<CreditCard size={40} />} title="No payments yet" sub="Payments appear here when you record them on orders." />
      ) : (
        <Card style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Order</th>
                  <th>Method</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const customer = getCustomer(p.customerId);
                  const order = getOrder(p.orderId);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDateTime(p.paidAt)}</td>
                      <td style={{ fontWeight: 600 }}>{customer?.name || '—'}</td>
                      <td style={{ color: 'var(--brand-500)', fontWeight: 800 }}>{order?.orderNumber || '—'}</td>
                      <td><Badge text={p.method} type="delivered" /></td>
                      <td style={{ fontWeight: 900, color: 'var(--success-600)' }}>{formatCurrency(p.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', fontWeight: 900, fontSize: 16 }}>
            Total: {formatCurrency(filtered.reduce((s, p) => s + p.amount, 0))}
          </div>
        </Card>
      )}
    </div>
  );
}
