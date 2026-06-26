// ─── Utility / helper functions ───────────────────────────────────────────────

/** Format a number as Indian Rupees */
export const formatCurrency = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

/** Format a date string to a readable label */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/** Format a date to day name + numeric date */
export const formatAppointmentDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

/** Relative time label (e.g. "2 hours ago") */
export const timeAgo = (dateStr: string): string => {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/** Generate next 7 available dates from today */
export const getNextDates = (count = 7): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

/** Truncate text with ellipsis */
export const truncate = (text: string, maxLen: number): string =>
  text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;

/** Generate a simple unique ID */
export const uid = (): string =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

// ─── Location utilities ──────────────────────────────────────────────────────
export { getDistanceKm, formatDistance, buildMapsLink, buildDirectionsLink } from './location';

/** Simulate Razorpay test payment — always succeeds after 1.5 s */
export const simulateRazorpayPayment = (
  amount: number,
  _orderId: string,
): Promise<{ paymentId: string; orderId: string; status: 'success' | 'failed' }> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        paymentId: 'pay_' + uid(),
        orderId: _orderId,
        status: 'success',
      });
    }, 1500);
  });
