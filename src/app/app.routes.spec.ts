import { routes } from './app.routes';
import { authGuard } from './auth.guard';

describe('SIDRO routes', () => {
  it('protects authenticated pages and exposes booking flows', () => {
    const booking = routes.find((route) => route.path === 'booking');
    const requests = routes.find((route) => route.path === 'my-requests');
    const dashboard = routes.find((route) => route.path === 'dashboard');

    expect(booking?.canActivate).toContain(authGuard);
    expect(requests?.canActivate).toContain(authGuard);
    expect(dashboard?.canActivate).toContain(authGuard);
    expect(routes.find((route) => route.path === 'login')?.canActivate).toBeUndefined();
    expect(routes.find((route) => route.path === 'register')?.canActivate).toBeUndefined();
  });
});
