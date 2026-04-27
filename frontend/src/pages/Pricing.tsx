import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { PageHeader, Button, Modal, Card } from '../components/UI';
import { Tag, Check, X, Plus } from 'lucide-react';
import { useToast } from '../components/Toast';
import { SUBJECTS, FORM_LEVELS } from '../types';
import type { SubjectCategory, FormLevel } from '../types';
import { useConfirmModal } from '../components/ConfirmModal';

export default function Pricing() {
  const { showToast } = useToast();
  const { openConfirm, modal: confirmModal } = useConfirmModal();
  const { pricing, updatePrice, addPricing } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(0);
  // temp editing for cells without existing pricing item
  const [tempEditing, setTempEditing] = useState<{ subject: string; form: FormLevel; category: SubjectCategory } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // New pricing form state
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<SubjectCategory>('Science');
  // prices for each form level when creating a new subject (Form 1..4)
  const [newPrices, setNewPrices] = useState<Record<string, number>>({
    'Form 1': 0,
    'Form 2': 0,
    'Form 3': 0,
    'Form 4': 0,
  });

  // Build subject list dynamically from both constants and pricing data
  const allSubjects = useMemo(() => {
    const map: Record<SubjectCategory, Set<string>> = {
      Science: new Set(SUBJECTS.Science),
      Languages: new Set(SUBJECTS.Languages),
      Humanities: new Set(SUBJECTS.Humanities),
    };
    for (const p of pricing) {
      if (!map[p.category]) map[p.category] = new Set();
      map[p.category].add(p.subject);
    }
    return {
      Science: Array.from(map.Science),
      Languages: Array.from(map.Languages),
      Humanities: Array.from(map.Humanities),
    } as Record<SubjectCategory, string[]>;
  }, [pricing]);

  const getPrice = (subject: string, form: FormLevel) =>
    pricing.find(p => p.subject === subject && p.formLevel === form);

  const startEdit = (id: string, price: number) => {
    setEditingId(id);
    setEditValue(price);
  };

  const saveEdit = async (id: string) => {
    if (editValue <= 0) return showToast('Enter a valid price.', 'error');
    const current = pricing.find(p => p.id === id);
    const currentPrice = current?.price ?? 0;
    const delta = Math.abs(editValue - currentPrice);
    const isCritical = currentPrice > 0 && delta / currentPrice >= 0.2;

    const applyUpdate = async () => {
      try {
        await updatePrice(id, editValue);
        showToast('Price updated successfully!', 'success');
        setEditingId(null);
      } catch {
        showToast('Failed to update price.', 'error');
      }
    };

    if (isCritical) {
      openConfirm({
        title: 'Confirm Major Price Change',
        message: (
          <div>
            <div>This change is larger than 20% and can impact future order charges.</div>
            <div style={{ marginTop: 8 }}>
              <strong>Old:</strong> {formatCurrency(currentPrice)} | <strong>New:</strong> {formatCurrency(editValue)}
            </div>
          </div>
        ),
        danger: true,
        confirmText: 'Apply Price',
        onConfirm: applyUpdate,
      });
      return;
    }
    try {
      await applyUpdate();
    } catch {
      showToast('Failed to update price.', 'error');
    }
  };

  const cancelEdit = () => setEditingId(null);

  const handleAddPricing = async () => {
    if (!newSubject.trim()) return showToast('Enter a subject name.', 'error');
    // collect provided prices (allow creating only those form levels that have a price)
    const entries = FORM_LEVELS
      .filter(f => !!newPrices[f] && newPrices[f] > 0)
      .map(f => ({ subject: newSubject.trim(), category: newCategory, formLevel: f, price: newPrices[f] }));
    try {
      if (entries.length === 0) {
        // No prices provided: create placeholder entries with price = 0 so subject shows in the table
        const placeholders = FORM_LEVELS.map(f => ({ subject: newSubject.trim(), category: newCategory, formLevel: f, price: 0 }));
        await Promise.all(placeholders.map(p => addPricing(p)));
        showToast('Subject created without prices. Set prices later by clicking a cell.', 'success');
      } else {
        // send create requests for each provided form-level price (in parallel)
        await Promise.all(entries.map(e => addPricing(e)));
        showToast(`${entries.length} pricing entr${entries.length === 1 ? 'y' : 'ies'} added!`, 'success');
      }
      setModalOpen(false);
      setNewSubject('');
      setNewPrices({ 'Form 1': 0, 'Form 2': 0, 'Form 3': 0, 'Form 4': 0 });
    } catch {
      showToast('Failed to add pricing.', 'error');
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Pricing Table"
        icon={<Tag size={18} />}
        subtitle="Click any price to edit it. Prices auto-fill in new orders."
        action={
          <Button onClick={() => setModalOpen(true)} size="md">
            <Plus size={16} />
            Add Subject
          </Button>
        }
      />

      {(Object.entries(allSubjects) as [SubjectCategory, string[]][]).map(([category, subjects]) => (
        <div key={category} style={{ marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: category === 'Science' ? 'var(--color-primary-light)' : category === 'Languages' ? 'var(--color-accent-light)' : 'var(--color-success-light)',
            color: category === 'Science' ? 'var(--color-primary)' : category === 'Languages' ? '#92400E' : 'var(--color-success)',
            padding: '5px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13, marginBottom: 14,
          }}>
            <Tag size={13} /> {category}
          </div>

          <Card style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 600 }}>
                <thead>
                  <tr>
                    <th>Subject</th>
                    {FORM_LEVELS.map(f => <th key={f}>{f}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(subject => (
                    <tr key={subject}>
                      <td style={{ fontWeight: 600 }}>{subject}</td>
                      {FORM_LEVELS.map(form => {
                        const item = getPrice(subject, form);
                        const existing = !!item;
                        const isEditingExisting = item && editingId === item.id;
                        const isEditingTemp = tempEditing && tempEditing.subject === subject && tempEditing.form === form;
                        const hasPrice = item ? (typeof item.price === 'number' && item.price > 0) : false;

                        return (
                          <td key={form}>
                            {isEditingExisting ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                  autoFocus
                                  type="number"
                                  value={editValue}
                                  onChange={e => setEditValue(Number(e.target.value))}
                                  onKeyDown={e => { if (e.key === 'Enter') void saveEdit(item!.id); if (e.key === 'Escape') cancelEdit(); }}
                                  style={{
                                    width: 90, padding: '4px 8px', border: '1.5px solid var(--color-primary)',
                                    borderRadius: 6, fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none',
                                  }}
                                />
                                <button onClick={() => void saveEdit(item!.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-success)' }}><Check size={15} /></button>
                                <button onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}><X size={15} /></button>
                              </div>
                            ) : isEditingTemp ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                  autoFocus
                                  type="number"
                                  value={editValue}
                                  onChange={e => setEditValue(Number(e.target.value))}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      // create new pricing entry
                                      void (async () => {
                                        try {
                                          await addPricing({ subject, category, formLevel: form, price: editValue });
                                          showToast('Price added successfully!', 'success');
                                          setTempEditing(null);
                                        } catch {
                                          showToast('Failed to add price.', 'error');
                                        }
                                      })();
                                    }
                                    if (e.key === 'Escape') setTempEditing(null);
                                  }}
                                  style={{
                                    width: 90, padding: '4px 8px', border: '1.5px solid var(--color-primary)',
                                    borderRadius: 6, fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none',
                                  }}
                                />
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await addPricing({ subject, category, formLevel: form, price: editValue });
                                      showToast('Price added successfully!', 'success');
                                      setTempEditing(null);
                                    } catch {
                                      showToast('Failed to add price.', 'error');
                                    }
                                  }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-success)' }}
                                ><Check size={15} /></button>
                                <button onClick={() => setTempEditing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}><X size={15} /></button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (existing) {
                                    // start editing existing
                                    startEdit(item!.id, item!.price);
                                  } else {
                                    // start temp editing for this subject/form
                                    setTempEditing({ subject, form, category });
                                    setEditValue(0);
                                  }
                                }}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  fontWeight: hasPrice ? 700 : 600, fontSize: 14, color: hasPrice ? 'var(--color-ink)' : 'var(--color-muted)',
                                  padding: '4px 8px', borderRadius: 6, transition: 'background 0.15s',
                                }}
                                title="Edit price"
                              >
                                {existing ? (hasPrice ? formatCurrency(item!.price) : '—') : '—'}
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ))}

      <div style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>
        💡 Tip: Click any price cell to edit it. Press Enter to save, Escape to cancel.
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Subject Price">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Subject name and category on same row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12, alignItems: 'end' }}>
            <div>
              <label className="form-label">Subject Name *</label>
              <input
                className="form-input"
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                style={{ fontWeight: 700 }}
              />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="form-input" value={newCategory} onChange={e => setNewCategory(e.target.value as SubjectCategory)}>
                {Object.keys(SUBJECTS).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Prices grid with distinct number input styling */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, flex: 1 }}>
              {FORM_LEVELS.map(f => (
                <div key={f}>
                  <label className="form-label">{f} Price (MK)</label>
                  <input
                    className="form-input"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    type="number"
                    min={0}
                    value={newPrices[f] ?? 0}
                    onChange={e => setNewPrices(prev => ({ ...prev, [f]: Number(e.target.value) }))}
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 700,
                      background: '#f7fafc',
                      border: '1px solid var(--color-border)',
                      padding: '8px 10px',
                      borderRadius: 8,
                      color: 'var(--color-ink)'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button onClick={handleAddPricing}>Add Subject</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  );
}

