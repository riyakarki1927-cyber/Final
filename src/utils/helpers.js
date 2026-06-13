// ── localStorage helpers ──────────────────────────────────────────────────────
export const storage = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch {}
  },
};

// ── Formatting ─────────────────────────────────────────────────────────────────
export const formatCurrency = (amount) =>
  `Rs. ${Number(amount).toLocaleString('en-NP')}`;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-NP', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-NP', {
    hour: '2-digit', minute: '2-digit',
  });

export const formatDateTime = (date) => `${formatDate(date)}, ${formatTime(date)}`;

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

// ── Status badge colors ────────────────────────────────────────────────────────
export const statusColor = (status) => {
  const map = {
    pending:     'bg-warning-100 text-yellow-700',
    accepted:    'bg-blue-100    text-blue-700',
    in_progress: 'bg-primary-100 text-primary-700',
    completed:   'bg-success-100 text-green-700',
    cancelled:   'bg-danger-100  text-red-700',
    active:      'bg-success-100 text-green-700',
    inactive:    'bg-surface-100 text-surface-500',
    blocked:     'bg-danger-100  text-red-700',
  };
  return map[status] || 'bg-surface-100 text-surface-600';
};

// ── Misc ───────────────────────────────────────────────────────────────────────
export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
