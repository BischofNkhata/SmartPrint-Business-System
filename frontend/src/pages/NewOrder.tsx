import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency, generateId } from '../utils';
import { Button, Card, PageHeader, KpiTile } from '../components/UI';
import { Plus, Trash2, ArrowLeft, FilePlus2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import type { OrderItem, FormLevel, SubjectCategory, PaymentMethod } from '../types';
import { SUBJECTS, FORM_LEVELS, PAYMENT_METHODS } from '../types';

export default function NewOrder() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { customers, pricing, addOrder, addCustomer, addPayment, updateCustomer } = useStore();

  const [customerId, setCustomerId] = useState('');
  const [newCustomerMode, setNewCustomerMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newFormLevel, setNewFormLevel] = useState<FormLevel>('Form 1');
  // searchable selector + inline edit states
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editFormLevel, setEditFormLevel] = useState<FormLevel>('Form 1');
  const [editingCustomer, setEditingCustomer] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointer = (e: Event) => {
      if (!showCustomerDropdown) return;
      const target = e.target as Node | null;
      if (dropdownRef.current && target && !dropdownRef.current.contains(target)) {
        setShowCustomerDropdown(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowCustomerDropdown(false); };

    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [showCustomerDropdown]);

  const [items, setItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');

  // Add item state
  const [addingItem, setAddingItem] = useState(false);
  const [itemCategory, setItemCategory] = useState<SubjectCategory>('Science');
  const [itemSubject, setItemSubject] = useState('Biology');
  const [itemForm, setItemForm] = useState<FormLevel>('Form 1');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);

  const totalAmount = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const getPriceSuggestion = (subject: string, form: FormLevel) => {
    const match = pricing.find(p => p.subject === subject && p.formLevel === form);
    return match?.price || 0;
  };

  const handleCategoryChange = (cat: SubjectCategory) => {
    setItemCategory(cat);
    const first = SUBJECTS[cat][0];
    setItemSubject(first);
    setItemPrice(getPriceSuggestion(first, itemForm));
  };

  const handleSubjectChange = (subj: string) => {
    setItemSubject(subj);
    setItemPrice(getPriceSuggestion(subj, itemForm));
  };

  const handleFormChange = (fl: FormLevel) => {
    setItemForm(fl);
    setItemPrice(getPriceSuggestion(itemSubject, fl));
  };

  const addItem = () => {
    if (itemQty <= 0 || itemPrice <= 0) {
      showToast('Quantity and unit price must be greater than 0.', 'error');
      return;
    }
    const item: OrderItem = {
      id: generateId(),
      subject: itemSubject,
      category: itemCategory,
      formLevel: itemForm,
      quantity: itemQty,
      unitPrice: itemPrice,
    };
    setItems(prev => [...prev, item]);
    setAddingItem(true);
    setItemQty(1);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const handleSubmit = async () => {
    if (items.length === 0) return showToast('Add at least one item.', 'error');

    let resolvedCustomerId = customerId;

    if (newCustomerMode) {
      if (!newName.trim()) return showToast('Enter customer name.', 'error');
      const nc = await addCustomer({ name: newName, phone: newPhone, formLevel: newFormLevel });
      resolvedCustomerId = nc.id;
    } else if (!resolvedCustomerId) {
      return showToast('Select a customer.', 'error');
    }

    try {
      const order = await addOrder({
        customerId: resolvedCustomerId,
        items,
        totalAmount,
        amountPaid: 0,
        orderStatus: 'Pending',
      });

      if (amountPaid > 0) {
        await addPayment({
          orderId: order.id,
          customerId: resolvedCustomerId,
          amount: amountPaid,
          method: payMethod,
          paidAt: new Date().toISOString(),
          notes: 'Initial payment',
        });
      }

      showToast('Order created successfully!', 'success');
      navigate(`/orders/${order.id}`);
    } catch {
      showToast('Failed to create order. Please try again.', 'error');
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 820, margin: '0 auto' }}>
      <PageHeader
        title="New Order"
        icon={<FilePlus2 size={18} />}
        subtitle="Fast entry flow optimized for mobile and desktop."
        action={<Button variant="secondary" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <KpiTile label="Items Added" value={items.length} tone="primary" />
        <KpiTile label="Order Total" value={formatCurrency(totalAmount)} tone="success" />
        <KpiTile label="Balance Due" value={formatCurrency(Math.max(0, totalAmount - amountPaid))} tone={amountPaid >= totalAmount ? 'success' : 'accent'} />
      </div>

      {/* Customer Selection */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Customer</div>
        {!newCustomerMode ? (
          <div>
            <label className="form-label">Select Existing Customer</label>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <input
                className="form-input"
                value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                onFocus={() => setShowCustomerDropdown(true)}
                onKeyDown={e => { if (e.key === 'Escape') setShowCustomerDropdown(false); }}
                placeholder="Search customers by name..."
              />
              {showCustomerDropdown && (
                <div style={{ position: 'absolute', left: 0, right: 0, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, maxHeight: 260, overflow: 'auto', zIndex: 30, boxShadow: 'var(--shadow-md)' }}>
                  {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setCustomerId(c.id);
                        setCustomerSearch(c.name);
                        setShowCustomerDropdown(false);
                        setEditName(c.name);
                        setEditPhone(c.phone ?? '');
                        setEditFormLevel(c.formLevel);
                        setEditingCustomer(false);
                      }}
                      style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                    >
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>{c.formLevel} {c.phone ? `· ${c.phone}` : ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setNewCustomerMode(true)} style={{ fontSize: 13, color: 'var(--brand-500)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }}>
                + New Customer
              </button>
              {customerId && (
                <button
                  onClick={() => setEditingCustomer(prev => !prev)}
                  style={{ fontSize: 13, color: 'var(--brand-500)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }}
                >
                  {editingCustomer ? 'Cancel Edit' : 'Edit Customer'}
                </button>
              )}
            </div>

            {/* Editable existing customer details */}
            {customerId && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Customer Details</div>
                {!editingCustomer ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
                    <div><div style={{ fontWeight: 600 }}>{editName}</div></div>
                    <div style={{ textAlign: 'right' }}>{editFormLevel} {editPhone ? `· ${editPhone}` : ''}</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
                    <div>
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={editName} onChange={e => setEditName(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Form Level</label>
                      <select className="form-input" value={editFormLevel} onChange={e => setEditFormLevel(e.target.value as FormLevel)}>
                        {FORM_LEVELS.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Phone</label>
                      <input className="form-input" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={async () => {
                          await updateCustomer(customerId, { name: editName, phone: editPhone || undefined, formLevel: editFormLevel });
                          showToast('Customer updated', 'success');
                          setEditingCustomer(false);
                        }}
                        style={{ padding: '10px 12px', borderRadius: 12, background: 'linear-gradient(135deg, var(--brand-500) 0%, var(--brand-600) 100%)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 900 }}
                      >Save</button>
                      <button onClick={() => setEditingCustomer(false)} style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--control-bg)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 900, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Chisomo Banda" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
               <div>
                 <label className="form-label">Phone</label>
                 <input className="form-input" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="e.g. 0991234567" />
               </div>
               <div>
                 <label className="form-label">Form Level</label>
                 <select className="form-input" value={newFormLevel} onChange={e => setNewFormLevel(e.target.value as FormLevel)}>
                   {FORM_LEVELS.map(f => <option key={f}>{f}</option>)}
                 </select>
               </div>
             </div>
            <button
              onClick={() => setNewCustomerMode(false)}
              style={{ fontSize: 13, color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              ← Use existing customer
            </button>
          </div>

        )}
      </Card>

      {/* Order Items */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Order Items</div>
        {items.length === 0 && !addingItem && (
          <div style={{ color: 'var(--color-muted)', fontSize: 14, marginBottom: 14 }}>No items added yet.</div>
        )}
        {items.map(item => (
          <div key={item.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: '1px solid var(--color-border)',
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>{item.subject}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{item.formLevel} · {item.category} · Qty: {item.quantity}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontWeight: 700 }}>{formatCurrency(item.unitPrice * item.quantity)}</div>
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

         {addingItem ? (
           <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--color-bg)', padding: 14, borderRadius: 10 }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
               <div>
                 <label className="form-label">Category</label>
                 <select className="form-input" value={itemCategory} onChange={e => handleCategoryChange(e.target.value as SubjectCategory)}>
                   {Object.keys(SUBJECTS).map(c => <option key={c}>{c}</option>)}
                 </select>
               </div>
               <div>
                 <label className="form-label">Subject</label>
                 <select className="form-input" value={itemSubject} onChange={e => handleSubjectChange(e.target.value)}>
                   {SUBJECTS[itemCategory].map(s => <option key={s}>{s}</option>)}
                 </select>
               </div>
               <div>
                 <label className="form-label">Form Level</label>
                 <select className="form-input" value={itemForm} onChange={e => handleFormChange(e.target.value as FormLevel)}>
                   {FORM_LEVELS.map(f => <option key={f}>{f}</option>)}
                 </select>
               </div>
               <div>
                 <label className="form-label">Quantity</label>
                 <input className="form-input" type="number" min={1} value={itemQty} onChange={e => setItemQty(Number(e.target.value))} />
               </div>
             </div>
            <div>
              <label className="form-label">Unit Price (MK) {getPriceSuggestion(itemSubject, itemForm) > 0 && <span style={{ color: 'var(--color-primary)', textTransform: 'none' }}>· Suggested: {formatCurrency(getPriceSuggestion(itemSubject, itemForm))}</span>}</label>
              <input
                className="form-input"
                type="number"
                value={itemPrice}
                onChange={e => setItemPrice(Number(e.target.value))}
                onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button onClick={addItem} size="sm">Add Item</Button>
              <Button variant="secondary" size="sm" onClick={() => setAddingItem(false)}>Cancel</Button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
              Tip: Press Enter in price field to add quickly.
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingItem(true)}
            style={{
              marginTop: 12, display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 14px', border: '1.5px dashed var(--color-border)',
              borderRadius: 8, cursor: 'pointer', background: 'none',
              color: 'var(--color-primary)', fontWeight: 600, fontSize: 14, width: '100%',
            }}
          >
            <Plus size={16} /> Add Item
          </button>
        )}

        {items.length > 0 && (
          <div style={{ marginTop: 16, padding: '12px 0', borderTop: '2px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20 }}>{formatCurrency(totalAmount)}</span>
          </div>
        )}
      </Card>

      {/* Payment */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Payment</div>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
           <div>
             <label className="form-label">Amount Paid Upfront (MK)</label>
             <input className="form-input" type="number" min={0} value={amountPaid} onChange={e => setAmountPaid(Number(e.target.value))} />
           </div>
           <div>
             <label className="form-label">Payment Method</label>
             <select className="form-input" value={payMethod} onChange={e => setPayMethod(e.target.value as PaymentMethod)}>
               {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
             </select>
           </div>
         </div>
        {totalAmount > 0 && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: amountPaid >= totalAmount ? 'var(--color-success-light)' : 'var(--color-accent-light)', borderRadius: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Balance: {formatCurrency(Math.max(0, totalAmount - amountPaid))}
              {amountPaid >= totalAmount ? ' ✓ Fully Paid' : ' (to collect later)'}
            </span>
          </div>
        )}
      </Card>

      {/* Notes */}
      <Card style={{ marginBottom: 24 }}>
        <label className="form-label">Notes (Optional)</label>
        <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions..." style={{ resize: 'vertical' }} />
      </Card>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', position: 'sticky', bottom: 10, background: 'var(--panel)', backdropFilter: 'blur(10px)', padding: 12, borderRadius: 16, border: '1px solid var(--border)' }}>
        <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={items.length === 0}>Create Order</Button>
      </div>
    </div>
  );
}
