import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VisualAssetsService } from '../../services/visual-assets.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './welcome.reference.html',
  styleUrl: './welcome.reference.scss'
})
export class WelcomeComponent {
  readonly visuals = inject(VisualAssetsService).assets;
}
