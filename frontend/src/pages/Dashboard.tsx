import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { Card, Badge, Button, PageHeader } from '../components/UI';
import { TrendingUp, ShoppingBag, DollarSign, Plus, ArrowUp, ArrowDown, Minus, CircleDollarSign, FileClock, HandCoins, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { startOfMonth } from 'date-fns';

export default function Dashboard() {
  const { orders, payments, expenses, customers } = useStore();
  const navigate = useNavigate();

  const now = new Date();
  const monthStart = startOfMonth(now).toISOString();

  const monthRevenue = payments
    .filter(p => p.paidAt >= monthStart)
    .reduce((s, p) => s + p.amount, 0);

  const monthExpenses = expenses
    .filter(e => e.date >= monthStart)
    .reduce((s, e) => s + e.amount, 0);

  const netProfit = monthRevenue - monthExpenses;

  const outstanding = orders
    .filter(o => o.orderStatus === 'Delivered' && o.paymentStatus !== 'Paid')
    .reduce((s, o) => s + (o.totalAmount - o.amountPaid), 0);

  const pipeline = {
    Pending: orders.filter(o => o.orderStatus === 'Pending').length,
    Ready: orders.filter(o => o.orderStatus === 'Ready').length,
    Delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
  };

  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStart = startOfMonth(lastMonth).toISOString();
  const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).toISOString();
  const lastMonthRevenue = payments
    .filter(p => p.paidAt >= lastMonthStart && p.paidAt <= lastMonthEnd)
    .reduce((s, p) => s + p.amount, 0);

  const revenueTrend = lastMonthRevenue > 0 ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
  const deliveredUnpaidOrders = orders.filter(o => o.orderStatus === 'Delivered' && o.paymentStatus !== 'Paid').length;
  const totalOrderValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const getCustomer = (id: string) => customers.find(c => c.id === id);

  return (
    <div className="fade-in">
      <PageHeader
        title="Dashboard"
        icon={<LayoutDashboard size={18} />}
        subtitle={new Date().toLocaleDateString('en-MW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />
      
      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Owner Snapshot</div>
              <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>
                One-screen view of business health and production flow.
              </div>
            </div>
            <Button onClick={() => navigate('/orders/new')} size="md">
              <Plus size={16} />
              Create Order
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
            <div className="metric-card metric-success" onClick={() => navigate('/payments')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-label" style={{ color: '#166534', fontSize: 12 }}>Cash In (Month)</span>
                <CircleDollarSign size={18} color="var(--color-success)" />
              </div>
              <div className="metric-value" style={{ color: 'var(--color-success)' }}>{formatCurrency(monthRevenue)}</div>
              <div style={{ marginTop: 8, color: 'var(--color-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                {revenueTrend > 0 ? <ArrowUp size={14} color="var(--color-success)" /> : revenueTrend < 0 ? <ArrowDown size={14} color="var(--color-danger)" /> : <Minus size={14} color="var(--color-muted)" />}
                {revenueTrend > 0 ? '+' : ''}{revenueTrend.toFixed(1)}% vs last month
              </div>
            </div>

            <div className="metric-card metric-danger" onClick={() => navigate('/expenses')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-label" style={{ color: '#991b1b', fontSize: 12 }}>Operating Costs</span>
                <DollarSign size={18} color="var(--color-danger)" />
              </div>
              <div className="metric-value" style={{ color: 'var(--color-danger)' }}>{formatCurrency(monthExpenses)}</div>
              <div style={{ marginTop: 8, color: 'var(--color-muted)', fontSize: 13 }}>Paper, consumables and maintenance</div>
            </div>

            <div className={`metric-card ${netProfit >= 0 ? 'metric-success' : 'metric-danger'}`} onClick={() => navigate('/reports')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-label" style={{ color: netProfit >= 0 ? '#166534' : '#991b1b', fontSize: 12 }}>Net Result</span>
                <TrendingUp size={18} color={netProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)'} />
              </div>
              <div className="metric-value" style={{ color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {formatCurrency(Math.abs(netProfit))}
              </div>
              <div style={{ marginTop: 8, color: 'var(--color-muted)', fontSize: 13 }}>
                {netProfit >= 0 ? 'Profit this month' : 'Loss this month'}
              </div>
            </div>

            <div className="metric-card metric-accent" onClick={() => navigate('/payments')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-label" style={{ color: '#9a3412', fontSize: 12 }}>Outstanding Credit</span>
                <HandCoins size={18} color="var(--color-accent)" />
              </div>
              <div className="metric-value" style={{ color: 'var(--color-accent)' }}>{formatCurrency(outstanding)}</div>
              <div style={{ marginTop: 8, color: 'var(--color-muted)', fontSize: 13 }}>
                {deliveredUnpaidOrders} delivered orders not fully paid
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gap: 18, marginBottom: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <Card>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <ShoppingBag size={18} /> Production Pipeline
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>
              Track active print flow from request to delivery.
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(90px, 1fr))', gap: 10 }}>
            {Object.entries(pipeline).map(([status, count]) => {
              const statusStyles: Record<string, { bg: string; border: string; text: string }> = {
                Pending: { bg: 'var(--tone-accent-bg)', border: '#fed7aa', text: '#9a3412' },
                Ready: { bg: 'var(--tone-success-bg)', border: '#bbf7d0', text: '#166534' },
                Delivered: { bg: 'var(--tone-primary-bg)', border: '#bfdbfe', text: '#1d4ed8' },
              };
              const style = statusStyles[status] ?? { bg: 'var(--color-surface-muted)', border: 'var(--color-border)', text: 'var(--color-ink)' };
              return (
              <button
                key={status}
                onClick={() => navigate('/orders')}
                style={{
                  border: `1px solid ${style.border}`,
                  borderRadius: 12,
                  padding: '12px 10px',
                  background: style.bg,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 26, fontFamily: 'DM Serif Display, serif', color: style.text }}>{count}</div>
                <div style={{ fontSize: 12, color: style.text, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {status}
                </div>
              </button>
            );
            })}
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileClock size={18} /> Business At A Glance
          </div>
          <div style={{ color: 'var(--color-muted)', fontSize: 14, marginBottom: 18 }}>
            Quickly check order and revenue volume.
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="soft-card" style={{ padding: 14 }}>
              <div className="metric-label">Total Orders</div>
              <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>{orders.length}</div>
            </div>
            <div className="soft-card" style={{ padding: 14 }}>
              <div className="metric-label">Total Order Value</div>
              <div style={{ marginTop: 6, fontSize: 22, fontFamily: 'DM Serif Display, serif' }}>{formatCurrency(totalOrderValue)}</div>
            </div>
            <div className="soft-card" style={{ padding: 14 }}>
              <div className="metric-label">Registered Customers</div>
              <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>{customers.length}</div>
            </div>
          </div>
        </Card>
      </div>

       <Card>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
           <div>
             <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Recent Orders</div>
             <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>
               Latest order activity
             </div>
           </div>
            <Button onClick={() => navigate('/orders')} variant="secondary" size="md">
             View All Orders
           </Button>
         </div>
         {recentOrders.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '48px 24px' }}>
             <ShoppingBag size={56} style={{ marginBottom: 16, opacity: 0.2, color: 'var(--color-muted)' }} />
             <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--color-ink)' }}>No orders yet</div>
             <div style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 24 }}>Create your first order to get started</div>
             <Button onClick={() => navigate('/orders/new')}>
               <Plus size={16} />
               Create First Order
             </Button>
           </div>
         ) : (
           <div style={{ overflowX: 'auto' }}>
             <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ borderBottom: '2px solid var(--color-border)', background: 'var(--color-bg)' }}>
                   <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 14, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order #</th>
                   <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 14, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                   <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: 14, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                   <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: 14, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                   <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: 14, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment</th>
                   <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 14, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                 </tr>
               </thead>
               <tbody>
                 {recentOrders.map((order, idx) => {
                   const customer = getCustomer(order.customerId);
                   return (
                     <tr
                       key={order.id}
                       onClick={() => navigate(`/orders/${order.id}`)}
                       style={{ cursor: 'pointer', borderBottom: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-muted)' }}
                     >
                       <td style={{ padding: '16px', fontWeight: 700, color: 'var(--color-primary)', fontSize: 15 }}>{order.orderNumber}</td>
                       <td style={{ padding: '16px', fontSize: 15 }}>{customer?.name || '—'}</td>
                       <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, fontSize: 15 }}>{formatCurrency(order.totalAmount)}</td>
                       <td style={{ padding: '16px', textAlign: 'center' }}><Badge text={order.orderStatus} type={order.orderStatus.toLowerCase().replace(' ', '-')} /></td>
                       <td style={{ padding: '16px', textAlign: 'center' }}><Badge text={order.paymentStatus} type={order.paymentStatus.toLowerCase()} /></td>
                       <td style={{ padding: '16px', color: 'var(--color-muted)', fontSize: 14 }}>{formatDate(order.createdAt)}</td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
         )}
       </Card>
    </div>
  );
}
