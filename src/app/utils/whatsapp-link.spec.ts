import { buildWhatsappLink, SALON_WHATSAPP_FALLBACK_MESSAGE } from './whatsapp-link';

describe('whatsapp-link (SIDRO)', () => {
  it('construye el enlace wa.me con el mensaje codificado', () => {
    const link = buildWhatsappLink('+593991234567', 'Hola, quiero reservar');
    expect(link).toBe(`https://wa.me/593991234567?text=${encodeURIComponent('Hola, quiero reservar')}`);
    expect(link).toContain('https://wa.me/593991234567?text=');
  });

  it('rechaza numeros invalidos', () => {
    expect(buildWhatsappLink('12345', 'Hola')).toBeNull();
    expect(buildWhatsappLink(null, 'Hola')).toBeNull();
    expect(buildWhatsappLink('', 'Hola')).toBeNull();
  });

  it('el mensaje por defecto menciona las reservas del salon', () => {
    expect(SALON_WHATSAPP_FALLBACK_MESSAGE).toContain('reservas');
    expect(buildWhatsappLink('+593991234567', SALON_WHATSAPP_FALLBACK_MESSAGE)).toContain(
      encodeURIComponent('reservas')
    );
  });
});
