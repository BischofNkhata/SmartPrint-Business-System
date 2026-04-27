import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { PageHeader, SearchInput, Badge, Modal, Button, Card, KpiTile } from '../components/UI';
import { Users, Plus, Phone, AlertTriangle } from 'lucide-react';
import { useToast } from '../components/Toast';
import type { FormLevel } from '../types';
import { FORM_LEVELS } from '../types';

export default function Customers() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { customers, orders, addCustomer } = useStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formLevel, setFormLevel] = useState<FormLevel>('Form 1');

  const getStats = (customerId: string) => {
    const cOrders = orders.filter(o => o.customerId === customerId);
    const totalSpent = cOrders.reduce((s, o) => s + o.amountPaid, 0);
    const outstanding = cOrders
      .filter(o => o.orderStatus === 'Delivered' && o.paymentStatus !== 'Paid')
      .reduce((s, o) => s + (o.totalAmount - o.amountPaid), 0);
    return { count: cOrders.length, totalSpent, outstanding };
  };

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!name.trim()) return showToast('Enter customer name.', 'error');
    try {
      await addCustomer({ name, phone, formLevel });
      showToast('Customer added successfully!', 'success');
      setModalOpen(false);
      setName(''); setPhone('');
    } catch {
      showToast('Failed to add customer.', 'error');
    }
  };

  // Calculate summary stats
  const totalCustomers = customers.length;
  const owingCustomers = customers.filter(c => getStats(c.id).outstanding > 0).length;
  const totalRevenue = customers.reduce((s, c) => s + getStats(c.id).totalSpent, 0);

  // Customer categories
  const owing = filtered.filter(c => getStats(c.id).outstanding > 0);
  const regular = filtered.filter(c => getStats(c.id).outstanding === 0);

  const CustomerCard = ({ customer, showStats = true }: { customer: typeof customers[0]; showStats?: boolean }) => {
    const stats = getStats(customer.id);
    const isOwing = stats.outstanding > 0;

    return (
      <div
        style={{
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onClick={() => navigate(`/customers/${customer.id}`)}
        onMouseEnter={(e: React.MouseEvent) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e: React.MouseEvent) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}
      >
        <Card style={{ borderLeft: `4px solid ${isOwing ? 'var(--color-danger)' : 'var(--color-success)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-ink)' }}>
                  {customer.name}
                </div>
                {isOwing && <AlertTriangle size={16} color="var(--color-danger)" />}
              </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                 <Badge text={customer.formLevel} type="delivered" />
               </div>
               {customer.phone && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-muted)' }}>
                   <Phone size={12} />
                   {customer.phone}
                 </div>
               )}
            </div>
          </div>

          {showStats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Orders</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-primary)' }}>{stats.count}</div>
              </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Paid</div>
                 <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-success)' }}>{formatCurrency(stats.totalSpent)}</div>
               </div>
              {stats.outstanding > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-danger)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Owes</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-danger)' }}>{formatCurrency(stats.outstanding)}</div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Customers"
        icon={<Users size={18} />}
        subtitle={`${totalCustomers} registered customers`}
        action={
          <Button onClick={() => setModalOpen(true)} size="md">
            <Plus size={16} />
            Add Customer
          </Button>
        }
      />

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 24 }}>
        <KpiTile label="Total Customers" value={totalCustomers} tone="primary" />
        <KpiTile label="Owing Customers" value={owingCustomers} tone="danger" />
        <KpiTile label="Revenue Collected" value={formatCurrency(totalRevenue)} tone="success" />
      </div>

       {/* Search */}
       <Card style={{ marginBottom: 20, padding: '16px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           <Users size={16} style={{ color: 'var(--color-muted)' }} />
           <span style={{ fontWeight: 600, fontSize: 14 }}>Search Customers</span>
         </div>
         <div style={{ marginTop: 12 }}>
           <SearchInput value={search} onChange={setSearch} placeholder="Search by name..." />
         </div>
       </Card>

      {/* Customer Lists */}
      {filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Users size={48} style={{ color: 'var(--color-muted)', marginBottom: 16, opacity: 0.5 }} />
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8 }}>
            {search ? 'No customers match your search' : 'No customers yet'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 20 }}>
            {search
              ? 'Try adjusting your search terms'
              : 'Start building your customer base by adding your first customer'
            }
          </div>
          <Button onClick={() => setModalOpen(true)} size="md">
            <Plus size={16} />
            Add First Customer
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Owing Customers */}
          {owing.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={16} color="var(--color-danger)" />
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-danger)' }}>
                  Customers with Outstanding Balances ({owing.length})
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'clamp(12px, 3vw, 16px)' }}>
                {owing.map(customer => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))}
              </div>
            </div>
          )}

          {/* All Other Customers */}
          {regular.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Users size={16} color="var(--color-primary)" />
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-primary)' }}>
                  Customers ({regular.length})
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'clamp(12px, 3vw, 16px)' }}>
                {regular.map(customer => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => setModalOpen(true)}>
        <Plus size={24} />
      </button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Customer">
         <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: '100%' }}>
           <div>
             <label className="form-label">Full Name *</label>
             <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chisomo Banda" />
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
             <div>
               <label className="form-label">Phone</label>
               <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0991234567" />
             </div>
             <div>
               <label className="form-label">Form Level</label>
               <select className="form-input" value={formLevel} onChange={e => setFormLevel(e.target.value as FormLevel)}>
                 {FORM_LEVELS.map(f => <option key={f}>{f}</option>)}
               </select>
             </div>
           </div>
           <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
             <Button onClick={handleAdd}>Add Customer</Button>
             <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
           </div>
         </div>
       </Modal>
    </div>
  );
}
