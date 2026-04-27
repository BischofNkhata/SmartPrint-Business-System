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
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-muted)' }}>
          <ShoppingBag size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
          <div style={{ fontWeight: 600 }}>No orders yet</div>
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
                const payColor = o.paymentStatus === 'Paid' ? 'var(--color-success)' : o.paymentStatus === 'Partial' ? 'var(--color-accent)' : 'var(--color-danger)';
                const statusColor = o.orderStatus === 'Delivered' ? 'var(--color-success)' : o.orderStatus === 'Ready' ? 'var(--color-primary)' : 'var(--color-accent)';

                return (
                  <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${o.id}`)}>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{o.orderNumber}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-muted)' }}>{formatDate(o.createdAt)}</td>
                    <td style={{ fontWeight: 600 }}>{customer?.name || '—'}</td>
                    <td><span style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>{o.orderStatus}</span></td>
                    <td><span style={{ fontSize: 12, fontWeight: 700, color: payColor }}>{o.paymentStatus}</span></td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(o.totalAmount)}</td>
                    <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>{formatCurrency(o.amountPaid)}</td>
                    <td style={{ color: balance > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 700 }}>{balance > 0 ? formatCurrency(balance) : '✓ Cleared'}</td>
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

