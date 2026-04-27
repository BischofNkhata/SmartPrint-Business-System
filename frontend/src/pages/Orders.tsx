import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { PageHeader, Badge, SearchInput, Button, Card, KpiTile } from '../components/UI';
import { Plus, ShoppingBag, Filter, Eye, Clock, CheckCircle, ChevronDown, History } from 'lucide-react';
import type { OrderStatus, PaymentStatus } from '../types';

export default function Orders() {
  const { orders, customers } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [payFilter, setPayFilter] = useState<PaymentStatus | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);
  // Order history is available on a dedicated page

  const getCustomer = (id: string) => customers.find(c => c.id === id);

  const filtered = orders.filter(o => {
    const customer = getCustomer(o.customerId);
    const matchSearch = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase())
      || (customer?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    const matchPay = payFilter === 'All' || o.paymentStatus === payFilter;
    return matchSearch && matchStatus && matchPay;
  });

  const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Calculate summary stats
  const totalRevenue = orders.reduce((s, o) => s + o.amountPaid, 0);
  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
  const unpaidAmount = orders
    .filter(o => o.orderStatus === 'Delivered' && o.paymentStatus !== 'Paid')
    .reduce((s, o) => s + (o.totalAmount - o.amountPaid), 0);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Ready': return <CheckCircle size={16} />;
      case 'Delivered': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'var(--color-accent)';
      case 'Ready': return 'var(--color-success)';
      case 'Delivered': return 'var(--color-success)';
      default: return 'var(--color-muted)';
    }
  };


  // helper to lookup orders is available in store when needed

  return (
    <div className="fade-in">
      <PageHeader
        title="Orders"
        icon={<ShoppingBag size={18} />}
        subtitle={`${orders.length} total orders`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => navigate('/orders/new')} size="md">
              <Plus size={16} />
              New Order
            </Button>
            <Button variant="secondary" onClick={() => navigate('/orders/history')} size="md">
              <History size={16} />
              Order History
            </Button>
          </div>
        }
      />


       {/* Quick Stats */}
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
         <KpiTile label="Revenue Collected" value={formatCurrency(totalRevenue)} tone="success" />
         <KpiTile label="Pending Orders" value={pendingOrders} tone="accent" />
         <KpiTile label="Outstanding Balance" value={formatCurrency(unpaidAmount)} tone="danger" />
       </div>

       {/* Filters - Collapsible on Mobile */}
       <Card style={{ marginBottom: 16, padding: 'clamp(12px, 3vw, 16px)' }}>
         <button
           onClick={() => setShowFilters(!showFilters)}
           style={{
             width: '100%',
             display: 'flex',
             alignItems: 'center',
             gap: 12,
             background: 'none',
             border: 'none',
             cursor: 'pointer',
             padding: 0,
             marginBottom: showFilters ? 12 : 0,
           }}
         >
           <Filter size={16} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
           <span style={{ fontWeight: 600, fontSize: 'clamp(13px, 2vw, 14px)' }}>Filters</span>
           <ChevronDown size={16} style={{ marginLeft: 'auto', color: 'var(--color-muted)', transform: showFilters ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
         </button>

         {showFilters && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
             {/* Search */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
               <span style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Search</span>
               <SearchInput value={search} onChange={setSearch} placeholder="Order # or customer..." />
             </div>

             {/* Status Filter - Responsive layout */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
               <span style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Order Status</span>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: 6 }}>
                 {(['All', 'Pending', 'Ready', 'Delivered'] as const).map(s =>
                   <button
                     key={s}
                     onClick={() => setStatusFilter(s)}
                     style={{
                       padding: 'clamp(6px, 2vw, 8px) clamp(8px, 2vw, 12px)',
                       borderRadius: 16,
                       fontSize: 'clamp(11px, 1.5vw, 12px)',
                       fontWeight: 600,
                       cursor: 'pointer',
                       border: '1.5px solid',
                       transition: 'all 0.15s',
                       borderColor: statusFilter === s ? 'var(--color-primary)' : 'var(--color-border)',
                       background: statusFilter === s ? 'var(--color-primary)' : 'white',
                       color: statusFilter === s ? 'white' : 'var(--color-muted)',
                       overflow: 'hidden',
                       textOverflow: 'ellipsis',
                       whiteSpace: 'nowrap',
                     }}
                   >
                     {s}
                   </button>
                 )}
               </div>
             </div>

             {/* Payment Filter - Responsive layout */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
               <span style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Payment Status</span>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: 6 }}>
                 {(['All', 'Unpaid', 'Partial', 'Paid'] as const).map(s =>
                   <button
                     key={s}
                     onClick={() => setPayFilter(s)}
                     style={{
                       padding: 'clamp(6px, 2vw, 8px) clamp(8px, 2vw, 12px)',
                       borderRadius: 16,
                       fontSize: 'clamp(11px, 1.5vw, 12px)',
                       fontWeight: 600,
                       cursor: 'pointer',
                       border: '1.5px solid',
                       transition: 'all 0.15s',
                       borderColor: payFilter === s ? 'var(--color-primary)' : 'var(--color-border)',
                       background: payFilter === s ? 'var(--color-primary)' : 'white',
                       color: payFilter === s ? 'white' : 'var(--color-muted)',
                       overflow: 'hidden',
                       textOverflow: 'ellipsis',
                       whiteSpace: 'nowrap',
                     }}
                   >
                     {s}
                   </button>
                 )}
               </div>
             </div>
           </div>
         )}
       </Card>

      {/* Orders */}
      {sorted.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <ShoppingBag size={48} style={{ color: 'var(--color-muted)', marginBottom: 16, opacity: 0.5 }} />
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8 }}>
            {search || statusFilter !== 'All' || payFilter !== 'All' ? 'No orders match your filters' : 'No orders yet'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 20 }}>
            {search || statusFilter !== 'All' || payFilter !== 'All'
              ? 'Try adjusting your search or filters'
              : 'Create your first order to get started with your business'
            }
          </div>
          <Button onClick={() => navigate('/orders/new')} size="md">
            <Plus size={16} />
            Create First Order
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map(order => {
            const customer = getCustomer(order.customerId);
            const balance = order.totalAmount - order.amountPaid;
            const statusColor = getStatusColor(order.orderStatus);

            return (
              <div
                key={order.id}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onClick={() => navigate(`/orders/${order.id}`)}
                onMouseEnter={(e: React.MouseEvent) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e: React.MouseEvent) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <Card style={{ borderLeft: `4px solid ${statusColor}` }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                     {/* Header row - Order number and status */}
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                       <span style={{ fontWeight: 700, fontSize: 'clamp(11px, 1.5vw, 12px)', color: 'var(--color-muted)' }}>
                         {order.orderNumber}
                       </span>
                       <div style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: 4,
                         padding: 'clamp(2px, 1vw, 4px) clamp(6px, 1.5vw, 8px)',
                         borderRadius: 12,
                         background: `${statusColor}20`,
                         color: statusColor,
                         fontSize: 'clamp(10px, 1.5vw, 12px)',
                         fontWeight: 600,
                       }}>
                         {getStatusIcon(order.orderStatus)}
                         <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>{order.orderStatus}</span>
                       </div>
                       <Badge text={order.paymentStatus} type={order.paymentStatus.toLowerCase()} />
                     </div>

                     {/* Customer and amount row */}
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                       <div style={{ flex: 1, minWidth: 0 }}>
                         <div style={{ fontWeight: 600, fontSize: 'clamp(15px, 3vw, 17px)', marginBottom: 4, color: 'var(--color-ink)' }}>
                           {customer?.name || 'Unknown Customer'}
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'clamp(11px, 1.5vw, 13px)', color: 'var(--color-muted)', flexWrap: 'wrap' }}>
                           <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                           <span>•</span>
                           <span>{formatDate(order.createdAt)}</span>
                         </div>
                       </div>

                       <div style={{ textAlign: 'right', minWidth: 'auto', whiteSpace: 'nowrap' }}>
                         <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 700, marginBottom: 4 }}>
                           {formatCurrency(order.totalAmount)}
                         </div>
                         {balance > 0 ? (
                           <div style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: 'var(--color-danger)', fontWeight: 600 }}>
                             Owes {formatCurrency(balance)}
                           </div>
                         ) : (
                           <div style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: 'var(--color-success)', fontWeight: 600 }}>
                             ✓ Paid
                           </div>
                         )}
                       </div>
                     </div>

                     {/* Notes if present */}
                     {order.notes && (
                       <div style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', fontStyle: 'italic', color: 'var(--color-muted)', paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                         {order.notes}
                       </div>
                     )}

                     {/* Quick Actions */}
                     <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                       <Button
                         size="sm"
                         variant="secondary"
                         onClick={(e) => {
                           e.stopPropagation();
                           navigate(`/orders/${order.id}`);
                         }}
                         style={{ fontSize: 'clamp(11px, 1.5vw, 12px)', flex: 1 }}
                       >
                         <Eye size={14} />
                         Details
                       </Button>
                       {balance > 0 && (
                         <Button
                           size="sm"
                           onClick={(e) => {
                             e.stopPropagation();
                             navigate(`/orders/${order.id}`);
                           }}
                           style={{ fontSize: 'clamp(11px, 1.5vw, 12px)', flex: 1 }}
                         >
                           Record Payment
                         </Button>
                       )}
                     </div>
                   </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => navigate('/orders/new')}>
        <Plus size={24} />
      </button>
    </div>
  );
}
