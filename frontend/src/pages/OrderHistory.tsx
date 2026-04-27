import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { PageHeader, Card } from '../components/UI';
import { ShoppingBag } from 'lucide-react';

export default function OrderHistory() {
  const { orders, customers } = useStore();
  const navigate = useNavigate();

  const getCustomer = (id: string) => customers.find(c => c.id === id);

  return (
    <div className="fade-in">
      <PageHeader title="Order History" icon={<ShoppingBag size={18} />} subtitle={`${orders.length} total orders`} />

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)', fontWeight: 800 }}>
          <ShoppingBag size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
          <div>No orders yet</div>
        </div>
      ) : (
        <Card style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Order Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {[...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(o => {
                const customer = getCustomer(o.customerId);
                const balance = o.totalAmount - o.amountPaid;
                const payColor = o.paymentStatus === 'Paid' ? 'var(--success-600)' : o.paymentStatus === 'Partial' ? 'var(--warning-600)' : 'var(--danger-600)';
                const statusColor = o.orderStatus === 'Delivered' ? 'var(--success-600)' : o.orderStatus === 'Ready' ? 'var(--brand-500)' : 'var(--warning-600)';

                return (
                  <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${o.id}`)}>
                    <td style={{ color: 'var(--brand-500)', fontWeight: 900 }}>{o.orderNumber}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>{formatDate(o.createdAt)}</td>
                    <td style={{ fontWeight: 800 }}>{customer?.name || '—'}</td>
                    <td><span style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>{o.orderStatus}</span></td>
                    <td><span style={{ fontSize: 12, fontWeight: 700, color: payColor }}>{o.paymentStatus}</span></td>
                    <td style={{ fontWeight: 800 }}>{formatCurrency(o.totalAmount)}</td>
                    <td style={{ color: 'var(--success-600)', fontWeight: 900 }}>{formatCurrency(o.amountPaid)}</td>
                    <td style={{ color: balance > 0 ? 'var(--danger-600)' : 'var(--success-600)', fontWeight: 900 }}>{balance > 0 ? formatCurrency(balance) : '✓ Cleared'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  );
}

