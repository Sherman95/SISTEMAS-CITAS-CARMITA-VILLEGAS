import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sidro-frontend';

  private readonly swUpdate = inject(SwUpdate, { optional: true });

  constructor() {
    if (!this.swUpdate?.isEnabled) return;

    this.swUpdate.versionUpdates
      .pipe(
        filter(
          (event): event is VersionReadyEvent => event.type === 'VERSION_READY'
        )
      )
      .subscribe(() => {
        void this.swUpdate?.activateUpdate().then(() => window.location.reload());
      });

    void this.swUpdate.checkForUpdate().catch(() => undefined);
  }
}
