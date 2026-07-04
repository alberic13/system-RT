/**
 * Converts a local Indonesian phone number to a WhatsApp wa.me URL.
 * e.g. 08123456789 -> https://wa.me/628123456789
 * 
 * @param {string} phone 
 * @returns {string}
 */
export const toWhatsAppUrl = (phone) => {
    if (!phone) return '#';
    const cleaned = phone.replace(/\D/g, ''); // strip non-digits
    const number = cleaned.startsWith('0')
        ? '62' + cleaned.slice(1)
        : cleaned.startsWith('62')
            ? cleaned
            : '62' + cleaned;
    return `https://wa.me/${number}`;
};

/**
 * Returns today's date as a YYYY-MM-DD string using LOCAL time,
 * not UTC — so it won't shift back one day for UTC+7 users after midnight.
 * 
 * @returns {string}  e.g. "2026-07-05"
 */
export const todayLocalISO = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

/**
 * Formats a date string (YYYY-MM-DD) to Indonesian short format.
 * e.g. "2026-07-05" -> "5 Jul 2026"
 * 
 * @param {string} dateStr  - date in "YYYY-MM-DD" format
 * @returns {string}        - formatted date string
 */
export const formatDateLocale = (dateStr) => {
    if (!dateStr) return '-';
    // Parse as local date (avoid UTC offset shifting the day)
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('id-ID', {
        day:   'numeric',
        month: 'short',
        year:  'numeric',
    });
};
