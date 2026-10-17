import { TestBed } from '@angular/core/testing';
import { VisualAssetsService } from './visual-assets.service';

describe('VisualAssetsService', () => {
  let service: VisualAssetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisualAssetsService);
  });

  it('prioritizes a future remote image URL', () => {
    expect(service.resolveServiceImage('Color', 'https://cdn.example.com/color.jpg'))
      .toBe('https://cdn.example.com/color.jpg');
  });

  it('uses the manicure fallback for nail services', () => {
    expect(service.resolveServiceImage('Manicure semipermanente'))
      .toBe(service.assets.serviceFallbacks.nails);
  });

  it('uses the color fallback for color and treatment services', () => {
    expect(service.resolveServiceImage('Tratamiento de color'))
      .toBe(service.assets.serviceFallbacks.color);
  });
});
