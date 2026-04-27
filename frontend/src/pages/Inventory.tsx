import { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { PageHeader, Modal, Button, EmptyState, Card, KpiTile } from '../components/UI';
import { Package, Plus, AlertTriangle, CheckCircle, Minus } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Inventory() {
  const { showToast } = useToast();
  const { inventory, addInventoryItem, adjustStock } = useStore();
  const [addModal, setAddModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState<string | null>(null);
  const [adjustDelta, setAdjustDelta] = useState(1);

  // New item form
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Ream');
  const [currentStock, setCurrentStock] = useState(0);
  const [threshold, setThreshold] = useState(1);
  const [costPerUnit, setCostPerUnit] = useState(0);

  const handleAdd = async () => {
    if (!name.trim()) return showToast('Enter item name.', 'error');
    try {
      await addInventoryItem({ name, unit, currentStock, lowStockThreshold: threshold, costPerUnit, lastRestockedAt: new Date().toISOString() });
      showToast('Inventory item added successfully!', 'success');
      setAddModal(false);
      setName(''); setUnit('Ream'); setCurrentStock(0); setThreshold(1); setCostPerUnit(0);
    } catch {
      showToast('Failed to add inventory item.', 'error');
    }
  };

  const handleAdjust = async (id: string, delta: number) => {
    try {
      await adjustStock(id, delta);
      showToast(delta > 0 ? 'Stock restocked successfully!' : 'Stock reduced successfully.', 'success');
      setAdjustModal(null);
      setAdjustDelta(1);
    } catch {
      showToast('Failed to adjust stock.', 'error');
    }
  };

  const low = inventory.filter(i => i.currentStock <= i.lowStockThreshold);
  const ok = inventory.filter(i => i.currentStock > i.lowStockThreshold);
  const stockValue = inventory.reduce((sum, i) => sum + i.currentStock * i.costPerUnit, 0);

  const ItemCard = ({ item }: { item: typeof inventory[0] }) => {
    const isLow = item.currentStock <= item.lowStockThreshold;
    return (
    <Card style={{
        border: `1.5px solid ${isLow ? 'var(--color-danger)' : '#bbf7d0'}`,
        background: isLow ? 'var(--tone-danger-bg)' : 'var(--tone-success-bg)',
        padding: 18,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{item.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
              Min: {item.lowStockThreshold} {item.unit} · {formatCurrency(item.costPerUnit)}/{item.unit}
            </div>
          </div>
          {isLow ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-danger)', fontSize: 12, fontWeight: 700 }}>
              <AlertTriangle size={14} /> Low
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-success)', fontSize: 12, fontWeight: 700 }}>
              <CheckCircle size={14} /> OK
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: isLow ? 'var(--color-danger)' : 'var(--color-ink)' }}>
            {item.currentStock}
            <span style={{ fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: 'var(--color-muted)', marginLeft: 4 }}>{item.unit}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => void adjustStock(item.id, -1)}
              style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Minus size={14} />
            </button>
            <button
              onClick={() => { setAdjustModal(item.id); setAdjustDelta(1); }}
              style={{ padding: '0 14px', height: 34, borderRadius: 8, background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              + Restock
            </button>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 8 }}>Last restocked: {formatDate(item.lastRestockedAt)}</div>
      </Card>
    );
  };

  const selectedItem = adjustModal ? inventory.find(i => i.id === adjustModal) : null;

  return (
    <div className="fade-in">
      <PageHeader title="Inventory" icon={<Package size={18} />} subtitle="Track your supplies" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
        <KpiTile label="Total Items" value={inventory.length} tone="primary" />
        <KpiTile label="Low Stock Items" value={low.length} tone={low.length > 0 ? 'danger' : 'success'} />
        <KpiTile label="Stock Value" value={formatCurrency(stockValue)} tone="accent" />
      </div>

      {low.length > 0 && (
        <div style={{ background: 'var(--color-danger-light)', border: '1px solid var(--color-danger)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-danger)', fontWeight: 600 }}>
          <AlertTriangle size={16} />
          {low.length} item{low.length > 1 ? 's' : ''} running low — restock soon!
        </div>
      )}

      {inventory.length === 0 ? (
        <EmptyState icon={<Package size={40} />} title="No inventory items" sub="Tap + to add items you track" />
      ) : (
        <div>
          {low.length > 0 && (
            <>
              <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--color-danger)' }}>⚠ Low Stock</div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'clamp(12px, 3vw, 14px)', marginBottom: 24 }}>
                 {low.map(i => <ItemCard key={i.id} item={i} />)}
               </div>
            </>
          )}
          {ok.length > 0 && (
            <>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>In Stock</div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'clamp(12px, 3vw, 14px)' }}>
                 {ok.map(i => <ItemCard key={i.id} item={i} />)}
               </div>
            </>
          )}
        </div>
      )}

      <button className="fab" onClick={() => setAddModal(true)}><Plus size={24} /></button>

      {/* Add Item Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Inventory Item">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
             <div>
               <label className="form-label">Item Name *</label>
               <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. A4 Paper" />
             </div>
             <div>
               <label className="form-label">Unit</label>
               <input className="form-input" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. Ream, Roll, Box" />
             </div>
             <div>
               <label className="form-label">Current Stock</label>
               <input className="form-input" type="number" min={0} value={currentStock} onChange={e => setCurrentStock(Number(e.target.value))} />
             </div>
             <div>
               <label className="form-label">Low Stock Alert At</label>
               <input className="form-input" type="number" min={0} value={threshold} onChange={e => setThreshold(Number(e.target.value))} />
             </div>
             <div>
               <label className="form-label">Cost Per Unit (MK)</label>
               <input className="form-input" type="number" min={0} value={costPerUnit} onChange={e => setCostPerUnit(Number(e.target.value))} />
             </div>
           </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button onClick={handleAdd}>Add Item</Button>
            <Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Restock Modal */}
      <Modal open={!!adjustModal} onClose={() => setAdjustModal(null)} title={`Restock — ${selectedItem?.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>Current stock: <strong>{selectedItem?.currentStock} {selectedItem?.unit}</strong></div>
          <div>
            <label className="form-label">Quantity to Add</label>
            <input className="form-input" type="number" min={1} value={adjustDelta} onChange={e => setAdjustDelta(Number(e.target.value))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button onClick={() => void handleAdjust(adjustModal!, adjustDelta)}>Confirm Restock</Button>
            <Button variant="secondary" onClick={() => setAdjustModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
