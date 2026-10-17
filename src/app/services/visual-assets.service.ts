import { Injectable } from '@angular/core';
import { SIDRO_VISUAL_ASSETS } from '../config/visual-assets.config';

@Injectable({
  providedIn: 'root'
})
export class VisualAssetsService {
  readonly assets = SIDRO_VISUAL_ASSETS;

  resolveServiceImage(
    serviceName: string,
    remoteUrl?: string | null,
    fallbackIndex = 0
  ): string {
    if (remoteUrl?.trim()) {
      return remoteUrl.trim();
    }

    const normalizedName = serviceName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (/manicure|pedicure|una|unas|nail/.test(normalizedName)) {
      return this.assets.serviceFallbacks.nails;
    }

    if (/color|tinte|mecha|balayage|decolor|tratamiento/.test(normalizedName)) {
      return this.assets.serviceFallbacks.color;
    }

    const fallbacks = [
      this.assets.serviceFallbacks.hair,
      this.assets.serviceFallbacks.color,
      this.assets.serviceFallbacks.nails
    ];

    return fallbacks[Math.abs(fallbackIndex) % fallbacks.length];
  }
}
