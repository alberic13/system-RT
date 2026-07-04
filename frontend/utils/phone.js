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
