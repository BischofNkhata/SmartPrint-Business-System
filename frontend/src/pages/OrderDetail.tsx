import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency, formatDateTime } from '../utils';
import { Button, Card, Badge, Modal } from '../components/UI';
import { ArrowLeft, CheckCircle, Circle, Printer, PencilLine, AlertTriangle } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useConfirmModal } from '../components/ConfirmModal';
import type { PaymentMethod, OrderStatus } from '../types';
import { PAYMENT_METHODS } from '../types';


export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { openConfirm, modal: confirmModal } = useConfirmModal();
  const { orders, customers, payments, updateOrderStatus, addPayment, deleteOrder, updateOrder } = useStore();

  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [newTotalAmount, setNewTotalAmount] = useState(0);
  const [priceReason, setPriceReason] = useState('');

  const order = orders.find(o => o.id === id);
  const customer = order ? customers.find(c => c.id === order.customerId) : null;
  const orderPayments = payments.filter(p => p.orderId === id);

  if (!order) return (
    <div style={{ padding: 24 }}>
      <Button variant="ghost" onClick={() => navigate('/orders')}><ArrowLeft size={16} /> Back</Button>
      <p>Order not found.</p>
    </div>
  );

  const balance = order.totalAmount - order.amountPaid;
  const statusFlow: OrderStatus[] = ['Pending', 'Ready', 'Delivered'];
  const currentIdx = statusFlow.indexOf(order.orderStatus);

  const handleRecordPayment = async () => {
    if (payAmount <= 0) return showToast('Enter a valid amount.', 'error');
    try {
      await addPayment({
        orderId: order.id,
        customerId: order.customerId,
        amount: payAmount,
        method: payMethod,
        paidAt: new Date().toISOString(),
      });
      showToast('Payment recorded successfully!', 'success');
      setPayModalOpen(false);
      setPayAmount(0);
    } catch {
      showToast('Failed to record payment.', 'error');
    }
  };

  const handleDelete = () => {
    openConfirm({
      title: 'Delete Order',
      message: `Are you sure you want to delete order ${order.orderNumber}? This action cannot be undone.`,
      danger: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await deleteOrder(order.id);
          showToast('Order deleted successfully.', 'success');
          navigate('/orders');
        } catch {
          showToast('Failed to delete order.', 'error');
        }
      },
    });
  };

  const handleAdjustOrderPrice = async () => {
    if (newTotalAmount <= 0) {
      showToast('Enter a valid total amount.', 'error');
      return;
    }
    if (!priceReason.trim()) {
      showToast('Add a reason for the price adjustment.', 'error');
      return;
    }
    if (newTotalAmount < order.amountPaid) {
      showToast('New total cannot be less than already paid amount.', 'error');
      return;
    }

    openConfirm({
      title: 'Confirm Order Price Adjustment',
      message: (
        <div>
          <div style={{ marginBottom: 8 }}>You are changing this order total:</div>
          <div><strong>Old:</strong> {formatCurrency(order.totalAmount)}</div>
          <div><strong>New:</strong> {formatCurrency(newTotalAmount)}</div>
          <div style={{ marginTop: 8 }}><strong>Reason:</strong> {priceReason}</div>
          <div style={{ marginTop: 10, color: 'var(--color-danger)', fontWeight: 600 }}>
            This affects payment status and financial reporting.
          </div>
        </div>
      ),
      danger: true,
      confirmText: 'Apply Adjustment',
      onConfirm: async () => {
        try {
          await updateOrder(order.id, {
            totalAmount: newTotalAmount,
            notes: `${order.notes ? `${order.notes}\n` : ''}[Price Adjustment] ${priceReason}`,
          });
          showToast('Order price updated successfully.', 'success');
          setPriceModalOpen(false);
          setPriceReason('');
        } catch {
          showToast('Failed to update order price.', 'error');
        }
      },
    });
  };

  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button variant="secondary" size="sm" onClick={() => navigate('/orders')}>
          <ArrowLeft size={16} />
          Back
        </Button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>{order.orderNumber}</h1>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <Badge text={order.orderStatus} type={order.orderStatus.toLowerCase().replace(/ /g, '-')} />
            <Badge text={order.paymentStatus} type={order.paymentStatus.toLowerCase()} />
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Printer size={15} /> Print
        </Button>
      </div>

      {/* Customer + Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(12px, 3vw, 16px)', marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Customer</div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{customer?.name || '—'}</div>
          {customer?.phone && <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>{customer.phone}</div>}
          {customer?.formLevel && <div style={{ fontSize: 13, marginTop: 4 }}><Badge text={customer.formLevel} type="delivered" /></div>}
        </Card>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Financial Summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--color-muted)', fontSize: 14 }}>Total</span>
            <span style={{ fontWeight: 700 }}>{formatCurrency(order.totalAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--color-muted)', fontSize: 14 }}>Paid</span>
            <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{formatCurrency(order.amountPaid)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 8, marginTop: 4 }}>
            <span style={{ fontWeight: 700 }}>Balance</span>
            <span style={{ fontWeight: 700, color: balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {formatCurrency(balance)}
            </span>
          </div>
          {balance > 0 && (
            <Button size="sm" style={{ marginTop: 12, width: '100%' }} onClick={() => setPayModalOpen(true)}>
              Record Payment
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            style={{ marginTop: 8, width: '100%' }}
            onClick={() => {
              setNewTotalAmount(order.totalAmount);
              setPriceModalOpen(true);
            }}
          >
            <PencilLine size={14} />
            Adjust Order Price
          </Button>
        </Card>
      </div>

      {/* Order Status Pipeline */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Order Status</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {statusFlow.map((status, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            return (
              <button
                key={status}
                onClick={() => void updateOrderStatus(order.id, status)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                  border: '1.5px solid',
                  borderColor: active ? 'var(--color-primary)' : done ? 'var(--color-success)' : 'var(--color-border)',
                  background: active ? 'var(--color-primary)' : done ? 'var(--color-success-light)' : 'white',
                  color: active ? 'white' : done ? 'var(--color-success)' : 'var(--color-muted)',
                  fontWeight: 600, fontSize: 13,
                }}
              >
                {done || active ? <CheckCircle size={14} /> : <Circle size={14} />}
                {status}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Order Items */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>Ordered Items</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Form</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.subject}</td>
                <td>{item.formLevel}</td>
                <td style={{ color: 'var(--color-muted)' }}>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(item.unitPrice * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 12, textAlign: 'right', fontSize: 18, fontFamily: 'DM Serif Display, serif' }}>
          Total: {formatCurrency(order.totalAmount)}
        </div>
      </Card>

      {/* Payment History */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>Payment History</div>
        {orderPayments.length === 0 ? (
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>No payments recorded yet.</p>
        ) : (
          orderPayments.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{formatCurrency(p.amount)}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{p.method} · {formatDateTime(p.paidAt)}</div>
              </div>
              <Badge text="Received" type="paid" />
            </div>
          ))
        )}
      </Card>

      {/* Meta */}
      <div style={{ color: 'var(--color-muted)', fontSize: 13, marginBottom: 24 }}>
        Created: {formatDateTime(order.createdAt)}
        {order.deliveredAt && ` · Delivered: ${formatDateTime(order.deliveredAt)}`}
        {order.notes && <div style={{ marginTop: 4 }}>Notes: {order.notes}</div>}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button variant="danger" size="sm" onClick={handleDelete}>Delete Order</Button>
      </div>

      {confirmModal}

      {/* Record Payment Modal */}
      <Modal open={payModalOpen} onClose={() => setPayModalOpen(false)} title="Record Payment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Outstanding Balance</label>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--color-danger)' }}>{formatCurrency(balance)}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <div>
              <label className="form-label">Amount Received (MK)</label>
              <input className="form-input" type="number" min={0} max={balance} value={payAmount} onChange={e => setPayAmount(Number(e.target.value))} />
            </div>
            <div>
              <label className="form-label">Payment Method</label>
              <select className="form-input" value={payMethod} onChange={e => setPayMethod(e.target.value as PaymentMethod)}>
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
            <Button variant="secondary" onClick={() => setPayModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal open={priceModalOpen} onClose={() => setPriceModalOpen(false)} title="Adjust Order Price">
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', background: 'var(--color-accent-light)', borderRadius: 10 }}>
            <AlertTriangle size={16} color="var(--color-accent)" />
            <span style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>
              Critical action: this changes business financial records.
            </span>
          </div>
          <div>
            <label className="form-label">Current Total</label>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20 }}>{formatCurrency(order.totalAmount)}</div>
          </div>
          <div>
            <label className="form-label">New Total Amount (MK)</label>
            <input className="form-input" type="number" min={0} value={newTotalAmount} onChange={e => setNewTotalAmount(Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Reason for Adjustment *</label>
            <textarea
              className="form-input"
              rows={3}
              value={priceReason}
              onChange={e => setPriceReason(e.target.value)}
              placeholder="e.g. Corrected quantity after customer changed order."
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="danger" onClick={() => void handleAdjustOrderPrice()}>Apply Adjustment</Button>
            <Button variant="secondary" onClick={() => setPriceModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
