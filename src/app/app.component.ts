import { Component, Renderer2, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MATERIAL_MODULES } from './shared/material/material';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ...MATERIAL_MODULES],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'GALACTIC ARCHIVES';
  highContrastMode = false;
  currentYear = new Date().getFullYear();
  private renderer = inject(Renderer2);

  constructor() {
    // Check if high contrast mode was previously enabled
    const savedMode = localStorage.getItem('highContrastMode');
    if (savedMode === 'true') {
      this.enableHighContrast(true);
    }
  }

  toggleHighContrast() {
    this.highContrastMode = !this.highContrastMode;
    this.enableHighContrast(this.highContrastMode);
    localStorage.setItem('highContrastMode', this.highContrastMode.toString());
  }

  private enableHighContrast(enable: boolean) {
    this.highContrastMode = enable;
    if (enable) {
      this.renderer.addClass(document.body, 'high-contrast-mode');
    } else {
      this.renderer.removeClass(document.body, 'high-contrast-mode');
    }
  }
}
