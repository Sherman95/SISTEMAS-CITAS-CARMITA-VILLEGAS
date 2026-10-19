export const buildWhatsappLink = (phone: string | null | undefined, message: string): string | null => {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

export const SALON_WHATSAPP_FALLBACK_MESSAGE = 'Hola, quiero consultar sobre mis reservas en Carmita Villegas.';
