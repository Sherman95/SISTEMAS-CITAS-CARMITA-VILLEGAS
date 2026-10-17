export interface SidroVisualAssetCatalog {
  brandLogo: string;
  welcomeHero: string;
  loginEditorial: string;
  dashboardFeature: string;
  serviceFallbacks: {
    hair: string;
    color: string;
    nails: string;
  };
}

/**
 * Recursos editoriales temporales de SIDRO.
 *
 * Este catálogo mantiene las rutas fuera de los componentes. Cuando el POS
 * publique URLs administrables, el resolvedor visual podrá priorizarlas sin
 * reconstruir las vistas.
 */
export const SIDRO_VISUAL_ASSETS: Readonly<SidroVisualAssetCatalog> = {
  brandLogo: '/a8f7a518-54ab-4d33-9d93-e98ca5b0b987.ico',
  welcomeHero: '/images/luxury/welcome-hero-v2.jpg',
  loginEditorial: '/images/luxury/login-editorial.jpg',
  dashboardFeature: '/images/luxury/dashboard-salon-v2.jpg',
  serviceFallbacks: {
    hair: '/images/luxury/service-hair.jpg',
    color: '/images/luxury/service-color.jpg',
    nails: '/images/luxury/service-nails.jpg'
  }
};
