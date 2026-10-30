/**
 * Robust date formatting and tenure calculations
 * Avoids timezone shift anomalies by parsing YYYY-MM-DD components directly.
 */

export function formatOrdinalDate(dateStr) {
  if (!dateStr) return '';
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
    const day = d;
    const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor((day % 100) / 10) === 1) ? 0 : day % 10];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[m - 1] || 'Jan';
    return `${String(day).padStart(2, '0')}${suffix} ${month}, ${y}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const day = d.getDate();
  const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor((day % 100) / 10) === 1) ? 0 : day % 10];
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${String(day).padStart(2, '0')}${suffix} ${month}, ${year}`;
}

export function calculateTenure(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) {
    return { years: 0, months: 0, days: 0, formatted: '0 Years', isReversed: false, isValid: false };
  }

  const [y1, m1, d1] = startDateStr.slice(0, 10).split('-').map(Number);
  const [y2, m2, d2] = endDateStr.slice(0, 10).split('-').map(Number);

  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) {
    return { years: 0, months: 0, days: 0, formatted: 'Invalid Dates', isReversed: false, isValid: false };
  }

  const dt1 = new Date(y1, m1 - 1, d1);
  const dt2 = new Date(y2, m2 - 1, d2);

  let isReversed = false;
  let start = dt1;
  let end = dt2;

  if (start > end) {
    isReversed = true;
    start = dt2;
    end = dt1;
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
  if (days > 0 && years === 0 && months === 0) {
    parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);
  }

  const formatted = parts.join(' and ') || '0 Days';
  return {
    years,
    months,
    days,
    formatted: isReversed ? `${formatted} (Notice: Dates Reversed)` : formatted,
    isReversed,
    isValid: true
  };
}

