import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArrowUpRight, CalendarClock, Check, CreditCard, LayoutDashboard, Plus, RefreshCw, ShieldCheck, Trash2, Wallet, X } from 'lucide-react';
import { api, Subscription, SubscriptionInput } from './api';

const today = new Date().toLocaleDateString('en-CA');
const initial: SubscriptionInput = { name: '', price: 9.99, renewalDate: today, billingCycle: 'MONTHLY' };
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

function daysUntil(date: string) {
  const current = new Date();
  const target = new Date(`${date}T00:00:00`);
  const midnight = new Date(current.getFullYear(), current.getMonth(), current.getDate());
  return Math.round((target.getTime() - midnight.getTime()) / 86400000);
}

export default function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [upcoming, setUpcoming] = useState<Subscription[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [form, setForm] = useState<SubscriptionInput>(initial);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [items, summary, soon] = await Promise.all([api.list(), api.summary(), api.upcoming()]);
      setSubscriptions(items.sort((a, b) => a.renewalDate.localeCompare(b.renewalDate)));
      setMonthlyTotal(summary.monthlyTotal);
      setUpcoming(soon);
      setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Cannot connect to backend.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  function beginAdd() { setForm(initial); setEditingId(null); setOpen(true); setError(''); }
  function beginEdit(item: Subscription) {
    setForm({ name: item.name, price: item.price, renewalDate: item.renewalDate, billingCycle: item.billingCycle });
    setEditingId(item.id); setOpen(true); setError('');
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    try {
      if (editingId !== null) await api.update(editingId, form);
      else await api.create(form);
      setOpen(false); setError(''); await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save'); }
    finally { setSaving(false); }
  }

  async function remove(item: Subscription) {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    try { await api.remove(item.id); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to delete'); }
  }

  const filtered = subscriptions.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const yearly = subscriptions.filter(s => s.billingCycle === 'YEARLY').length;

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon"><ShieldCheck size={22}/></span><span>Sub<span className="brand-accent">Guard</span><small>Subscription manager</small></span></div>
      <div className="nav-heading">WORKSPACE</div>
      <div className="nav-item active"><LayoutDashboard size={18}/> Overview</div>
      <div className="nav-item"><CreditCard size={18}/> Subscriptions <span className="nav-count">{subscriptions.length}</span></div>
      <div className="sidebar-bottom"><div className="status-dot"/> Local workspace <small>Powered by Spring Boot</small></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="crumb">Workspace <span>/</span> Overview</div><div className="avatar">SG</div></header>
      <div className="content">
        <div className="heading-row"><div><div className="eyebrow">YOUR FINANCIAL OVERVIEW</div><h1>Subscriptions, simplified.</h1><p className="subtitle">Stay on top of renewals and know exactly where your money goes.</p></div><button className="primary" onClick={beginAdd}><Plus size={17}/> Add subscription</button></div>
        {error && <div className="error" role="alert"><AlertCircle size={18}/>{error}<button onClick={() => setError('')} aria-label="Dismiss"><X size={16}/></button></div>}
        <div className="stats">
          <div className="stat"><div className="stat-top"><span>Monthly spending</span><span className="stat-icon violet"><Wallet size={19}/></span></div><div className="stat-value">{money(monthlyTotal)}</div><div className="stat-foot"><ArrowUpRight size={14}/> Estimated monthly equivalent</div></div>
          <div className="stat"><div className="stat-top"><span>Active subscriptions</span><span className="stat-icon blue"><CreditCard size={19}/></span></div><div className="stat-value">{subscriptions.length}</div><div className="stat-foot"><Check size={14}/> Currently tracking</div></div>
          <div className="stat"><div className="stat-top"><span>Renewing soon</span><span className="stat-icon orange"><CalendarClock size={19}/></span></div><div className="stat-value">{upcoming.length}</div><div className="stat-foot">In the next 7 days</div></div>
          <div className="stat"><div className="stat-top"><span>Annual plans</span><span className="stat-icon mint"><RefreshCw size={19}/></span></div><div className="stat-value">{yearly}</div><div className="stat-foot">Billed once a year</div></div>
        </div>
        <section className="section"><div className="section-heading"><div><h2>All subscriptions</h2><p>Your recurring payments in one place</p></div><input className="search" placeholder="Search subscriptions..." aria-label="Search subscriptions" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="table-wrap"><table><thead><tr><th>SUBSCRIPTION</th><th>PRICE</th><th>BILLING</th><th>NEXT RENEWAL</th><th>STATUS</th><th></th></tr></thead><tbody>
            {filtered.map(item => { const days = daysUntil(item.renewalDate); return <tr key={item.id}><td><div className="service-cell"><span className="service-logo">{item.name.slice(0,1).toUpperCase()}</span><div><strong>{item.name}</strong><small>Subscription #{item.id}</small></div></div></td><td className="price">{money(item.price)}</td><td><span className="cycle">{item.billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly'}</span></td><td>{new Date(`${item.renewalDate}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td><td><span className={`badge ${days >= 0 && days <= 7 ? 'soon' : days < 0 ? 'past' : 'good'}`}>{days < 0 ? 'Past due' : days <= 7 ? 'Coming up' : 'Scheduled'}</span></td><td><div className="actions"><button onClick={()=>beginEdit(item)} title="Edit subscription">Edit</button><button className="icon-button" title="Delete subscription" onClick={()=>void remove(item)}><Trash2 size={16}/></button></div></td></tr>; })}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="empty">{search ? 'No subscriptions match your search.' : 'No subscriptions yet. Click “Add subscription” to get started.'}</td></tr>}
            {loading && <tr><td colSpan={6} className="empty">Loading subscriptions...</td></tr>}
          </tbody></table></div>
          <div className="table-footer">Showing {filtered.length} of {subscriptions.length} subscriptions</div>
        </section>
        <footer>SubGuard · Built with Java, Spring Boot, React & PostgreSQL</footer>
      </div>
    </main>
    {open && <div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><h2 id="modal-title">{editingId===null?'Add subscription':'Edit subscription'}</h2><p>Keep your renewal details organized.</p></div><button className="icon-button" onClick={()=>setOpen(false)} aria-label="Close"><X size={20}/></button></div><form onSubmit={e=>void save(e)}>
      <label>Subscription name<input required maxLength={100} placeholder="e.g. Spotify" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label>Price (USD)<input required type="number" min="0.01" max="99999999.99" step="0.01" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})}/></label>
      <label>Billing cycle<select value={form.billingCycle} onChange={e=>setForm({...form,billingCycle:e.target.value as SubscriptionInput['billingCycle']})}><option value="MONTHLY">Monthly</option><option value="YEARLY">Yearly</option></select></label>
      <label>Next renewal date<input required type="date" value={form.renewalDate} onChange={e=>setForm({...form,renewalDate:e.target.value})}/></label>
      <div className="form-actions"><button type="button" className="secondary" onClick={()=>setOpen(false)}>Cancel</button><button className="primary" disabled={saving} type="submit">{saving?'Saving...':editingId===null?'Add subscription':'Save changes'}</button></div>
    </form></div></div>}
  </div>;
}
