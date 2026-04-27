import { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { PageHeader, Modal, Button, EmptyState, Badge, Card, KpiTile } from '../components/UI';
import { Receipt, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../types';
import { useConfirmModal } from '../components/ConfirmModal';

const COLORS = ['#2563EB', '#F59E0B', '#16A34A', '#DC2626', '#7C3AED', '#0891B2', '#9CA3AF'];

export default function Expenses() {
  const { showToast } = useToast();
  const { openConfirm, modal: confirmModal } = useConfirmModal();
  const { expenses, addExpense, deleteExpense } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('Paper (Ream)');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  const totalThisMonth = expenses
    .filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, e) => s + e.amount, 0);

  // Chart data
  const byCategory = EXPENSE_CATEGORIES.map((cat, i) => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    color: COLORS[i % COLORS.length],
  })).filter(d => d.value > 0);
  const totalAllTime = expenses.reduce((s, e) => s + e.amount, 0);
  const avgExpense = expenses.length ? totalAllTime / expenses.length : 0;

  const handleAdd = async () => {
    if (!description.trim() || amount <= 0) return showToast('Fill in all fields.', 'error');
    try {
      await addExpense({ category, description, amount, date });
      showToast('Expense logged successfully!', 'success');
      setModalOpen(false);
      setDescription(''); setAmount(0);
    } catch {
      showToast('Failed to log expense.', 'error');
    }
  };

  const handleDelete = async (id: string, description: string) => {
    openConfirm({
      title: 'Delete Expense Record',
      message: `Delete "${description}" permanently? This affects reports and profit calculations.`,
      danger: true,
      confirmText: 'Delete Expense',
      onConfirm: async () => {
        try {
          await deleteExpense(id);
          showToast('Expense deleted successfully.', 'success');
        } catch {
          showToast('Failed to delete expense.', 'error');
        }
      },
    });
  };

  return (
    <div className="fade-in">
      <PageHeader title="Expenses" icon={<Receipt size={18} />} subtitle="Track all business costs" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <KpiTile label="Expenses This Month" value={formatCurrency(totalThisMonth)} tone="danger" />
        <KpiTile label="Total Expenses" value={formatCurrency(totalAllTime)} tone="accent" />
        <KpiTile label="Average Expense" value={formatCurrency(avgExpense)} tone="primary" />
      </div>

      {byCategory.length > 0 && (
          <Card style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Category Breakdown</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" cx="50%" cy="50%" outerRadius={66} innerRadius={42} label={false} paddingAngle={2}>
                  {byCategory.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
      )}

      {/* Expense List */}
      {sorted.length === 0 ? (
        <EmptyState icon={<Receipt size={40} />} title="No expenses recorded" sub="Tap + to log your first expense" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map(exp => (
            <Card key={exp.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{exp.description}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 3, display: 'flex', gap: 8 }}>
                  <Badge text={exp.category} type="delivered" />
                  <span>{formatDate(exp.date)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, color: 'var(--color-danger)', fontWeight: 700 }}>{formatCurrency(exp.amount)}</div>
                <button onClick={() => void handleDelete(exp.id, exp.description)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => setModalOpen(true)}><Plus size={24} /></button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Expense">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Category</label>
            <select className="form-input" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)}>
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Description *</label>
            <input className="form-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. 5 reams A4 paper from Chipiku" />
          </div>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
             <div>
               <label className="form-label">Amount (MK) *</label>
               <input className="form-input" type="number" min={0} value={amount} onChange={e => setAmount(Number(e.target.value))} />
             </div>
             <div>
               <label className="form-label">Date</label>
               <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
             </div>
           </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button onClick={handleAdd}>Save Expense</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  );
}
