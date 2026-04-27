import { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { PageHeader, Card, KpiTile, FilterChip } from '../components/UI';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { startOfWeek, startOfMonth, startOfQuarter } from 'date-fns';
import { Download, BarChart3 } from 'lucide-react';

type Range = 'week' | 'month' | 'quarter' | 'all';

const COLORS = ['#2563EB', '#F59E0B', '#16A34A', '#DC2626', '#7C3AED', '#0891B2', '#9CA3AF'];

export default function Reports() {
  const { orders, payments, expenses, customers } = useStore();
  const [range, setRange] = useState<Range>('month');

  const getRangeStart = (): string => {
    const now = new Date();
    if (range === 'week') return startOfWeek(now).toISOString();
    if (range === 'month') return startOfMonth(now).toISOString();
    if (range === 'quarter') return startOfQuarter(now).toISOString();
    return '2000-01-01T00:00:00.000Z';
  };

  const rangeStart = getRangeStart();

  const periodPayments = payments.filter(p => p.paidAt >= rangeStart);
  const periodExpenses = expenses.filter(e => e.date >= rangeStart);

  const revenue = periodPayments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = periodExpenses.reduce((s, e) => s + e.amount, 0);
  const profit = revenue - totalExpenses;

  // Outstanding loans (all time — delivered but not fully paid)
  const loans = orders
    .filter(o => o.orderStatus === 'Delivered' && o.paymentStatus !== 'Paid')
    .map(o => {
      const customer = customers.find(c => c.id === o.customerId);
      const daysOut = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 86400000);
      return { order: o, customer, balance: o.totalAmount - o.amountPaid, daysOut };
    })
    .sort((a, b) => b.balance - a.balance);

  const totalOutstanding = loans.reduce((s, l) => s + l.balance, 0);

  // Top subjects
  const subjectMap: Record<string, number> = {};
  orders
    .filter(o => o.createdAt >= rangeStart)
    .flatMap(o => o.items)
    .forEach(item => {
      subjectMap[item.subject] = (subjectMap[item.subject] || 0) + item.quantity;
    });
  const topSubjects = Object.entries(subjectMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  // Top customers
  const customerMap: Record<string, { name: string; total: number; count: number }> = {};
  periodPayments.forEach(p => {
    const c = customers.find(c => c.id === p.customerId);
    if (!c) return;
    if (!customerMap[c.id]) customerMap[c.id] = { name: c.name, total: 0, count: 0 };
    customerMap[c.id].total += p.amount;
    customerMap[c.id].count += 1;
  });
  const topCustomers = Object.values(customerMap).sort((a, b) => b.total - a.total).slice(0, 5);

  // Expense breakdown
  const expByCategory: Record<string, number> = {};
  periodExpenses.forEach(e => {
    expByCategory[e.category] = (expByCategory[e.category] || 0) + e.amount;
  });
  const expChart = Object.entries(expByCategory).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));

  // CSV Export
  const exportCSV = () => {
    const rows = [
      ['Report', range.toUpperCase()],
      ['Revenue', revenue],
      ['Expenses', totalExpenses],
      ['Net Profit', profit],
      ['Outstanding Loans', totalOutstanding],
      [],
      ['Outstanding Loans Detail'],
      ['Order#', 'Customer', 'Balance (MK)', 'Days Outstanding'],
      ...loans.map(l => [l.order.orderNumber, l.customer?.name || '—', l.balance, l.daysOut]),
      [],
      ['Top Subjects'],
      ['Subject', 'Quantity Ordered'],
      ...topSubjects.map(s => [s.name, s.qty]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zozode-report-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rangeLabels: Record<Range, string> = {
    week: 'This Week', month: 'This Month', quarter: 'This Quarter', all: 'All Time',
  };

  const filterBtn = (r: Range) => (
    <FilterChip key={r} label={rangeLabels[r]} active={range === r} onClick={() => setRange(r)} />
  );

  return (
    <div className="fade-in">
      <PageHeader
        title="Reports"
        icon={<BarChart3 size={18} />}
        subtitle="Business performance overview"
        action={
          <button
            onClick={exportCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
              background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 8,
              cursor: 'pointer', fontWeight: 600, fontSize: 13,
            }}
          >
            <Download size={15} /> Export CSV
          </button>
        }
      />

      {/* Range Selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {(['week', 'month', 'quarter', 'all'] as Range[]).map(filterBtn)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <KpiTile label="Revenue" value={formatCurrency(revenue)} tone="success" />
        <KpiTile label="Expenses" value={formatCurrency(totalExpenses)} tone="danger" />
        <KpiTile label={profit >= 0 ? 'Net Profit' : 'Net Loss'} value={formatCurrency(Math.abs(profit))} tone={profit >= 0 ? 'success' : 'danger'} />
        <KpiTile label="Outstanding Credit" value={formatCurrency(totalOutstanding)} tone="accent" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Top Subjects Chart */}
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Top Subjects by Quantity</div>
          {topSubjects.length === 0 ? (
            <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>No orders in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topSubjects} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="var(--color-border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="qty" name="Qty Ordered" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Expense Breakdown</div>
          {expChart.length === 0 ? (
            <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>No expenses in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={expChart} dataKey="value" cx="50%" cy="50%" outerRadius={72} innerRadius={42} label={false}>
                  {expChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Outstanding Loans Table */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Outstanding Loans ({loans.length})</span>
          {totalOutstanding > 0 && <span style={{ color: 'var(--color-danger)', fontSize: 15 }}>{formatCurrency(totalOutstanding)} total</span>}
        </div>
        {loans.length === 0 ? (
          <p style={{ color: 'var(--color-success)', fontSize: 14, fontWeight: 600 }}>✓ No outstanding loans — all delivered orders are paid!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Days Out</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(({ order, customer, balance, daysOut }) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{order.orderNumber}</td>
                    <td style={{ fontWeight: 600 }}>{customer?.name || '—'}</td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>{formatCurrency(order.amountPaid)}</td>
                    <td style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{formatCurrency(balance)}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                        background: daysOut > 14 ? 'var(--color-danger-light)' : 'var(--color-accent-light)',
                        color: daysOut > 14 ? 'var(--color-danger)' : '#92400E',
                      }}>
                        {daysOut}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Top Customers */}
      <Card>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>Top Customers — {rangeLabels[range]}</div>
        {topCustomers.length === 0 ? (
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>No payment data in this period.</p>
        ) : (
          topCustomers.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{c.count} payment{c.count !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18 }}>{formatCurrency(c.total)}</div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
