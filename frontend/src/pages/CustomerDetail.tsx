import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { FormLevel } from '../types';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { Button, Card, Badge } from '../components/UI';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useConfirmModal } from '../components/ConfirmModal';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { openConfirm, modal: confirmModal } = useConfirmModal();
  const { customers, orders, payments, deleteCustomer, updateCustomer } = useStore();

  const customer = customers.find(c => c.id === id);

  const [editing, setEditing] = useState(false);
  const [nameEdit, setNameEdit] = useState(() => customer ? customer.name : '');
  const [phoneEdit, setPhoneEdit] = useState(() => customer ? customer.phone ?? '' : '');
  const [formLevelEdit, setFormLevelEdit] = useState<FormLevel>(() => (customer ? customer.formLevel : 'Form 1'));

  // Note: we initialize edit fields lazily from `customer` above. To avoid
  // calling setState synchronously inside an effect (which can trigger the
  // react-hooks/set-state-in-effect ESLint rule), we populate the edit fields
  // when the user opens Edit mode instead of synchronously on customer change.
  const customerOrders = orders.filter(o => o.customerId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const customerPayments = payments.filter(p => p.customerId === id);

  if (!customer) return (
    <div style={{ padding: 24 }}>
      <Button variant="ghost" onClick={() => navigate('/customers')}><ArrowLeft size={16} /> Back</Button>
      <p>Customer not found.</p>
    </div>
  );

  const totalSpent = customerPayments.reduce((s, p) => s + p.amount, 0);
  const outstanding = customerOrders
    .filter(o => o.orderStatus === 'Delivered' && o.paymentStatus !== 'Paid')
    .reduce((s, o) => s + (o.totalAmount - o.amountPaid), 0);

  const handleDelete = () => {
    openConfirm({
      title: 'Delete Customer',
      message: `Are you sure you want to delete ${customer.name}? This will also remove all associated orders and payments. This action cannot be undone.`,
      danger: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await deleteCustomer(customer.id);
          showToast('Customer deleted successfully.', 'success');
          navigate('/customers');
        } catch {
          showToast('Failed to delete customer.', 'error');
        }
      },
    });
  };

  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/customers')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>{customer.name}</h1>
          <div style={{ marginTop: 4 }}><Badge text={customer.formLevel} type="delivered" /></div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Orders', value: customerOrders.length.toString() },
          { label: 'Total Spent', value: formatCurrency(totalSpent) },
          { label: 'Outstanding', value: formatCurrency(outstanding) },
        ].map(s => (
          <Card key={s.label}>
            <div style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, marginTop: 4 }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Info */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>Contact Info</div>
          <div>
            {!editing ? (
              <button onClick={() => {
                if (customer) {
                  setNameEdit(customer.name);
                  setPhoneEdit(customer.phone ?? '');
                  setFormLevelEdit(customer.formLevel);
                }
                setEditing(true);
              }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}>Edit</button>
            ) : (
              <>
                <button
                  onClick={async () => {
                    try {
                      await updateCustomer(customer.id, { name: nameEdit, phone: phoneEdit || undefined, formLevel: formLevelEdit });
                      showToast('Customer updated', 'success');
                      setEditing(false);
                    } catch {
                      showToast('Failed to update customer', 'error');
                    }
                  }}
                  style={{ marginRight: 8, padding: '6px 10px', borderRadius: 8, background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer' }}
                >Save</button>
                <button onClick={() => { setEditing(false); if (customer) { setNameEdit(customer.name); setPhoneEdit(customer.phone ?? ''); setFormLevelEdit(customer.formLevel); } }} style={{ padding: '6px 10px', borderRadius: 8, background: 'white', border: '1px solid var(--color-border)' }}>Cancel</button>
              </>
            )}
          </div>
        </div>

        {!editing ? (
          <>
            {customer.phone && <div style={{ fontSize: 14, marginBottom: 6 }}>📱 {customer.phone}</div>}
            <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>Customer since {formatDate(customer.createdAt)}</div>
          </>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <label className="form-label">Full Name</label>
              <input className="form-input" value={nameEdit} onChange={e => setNameEdit(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" value={phoneEdit} onChange={e => setPhoneEdit(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label className="form-label">Form Level</label>
              <select className="form-input" value={formLevelEdit} onChange={e => setFormLevelEdit(e.target.value as FormLevel)}>
                {['Form 1','Form 2','Form 3','Form 4'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Orders */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>Order History ({customerOrders.length})</div>
        {customerOrders.length === 0 ? (
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>No orders yet.</p>
        ) : (
          customerOrders.map(order => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
            >
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 14 }}>{order.orderNumber}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{formatDate(order.createdAt)} · {order.items.length} item(s)</div>
                <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                  <Badge text={order.orderStatus} type={order.orderStatus.toLowerCase().replace(/ /g, '-')} />
                  <Badge text={order.paymentStatus} type={order.paymentStatus.toLowerCase()} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{formatCurrency(order.totalAmount)}</div>
                {order.totalAmount - order.amountPaid > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--color-danger)' }}>Owes {formatCurrency(order.totalAmount - order.amountPaid)}</div>
                )}
              </div>
            </div>
          ))
        )}
      </Card>

      <Button variant="danger" size="sm" onClick={handleDelete}>Delete Customer</Button>
      {confirmModal}
    </div>
  );
}
