import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Galactic Archives'; // The name of our noble endeavor

  // The Cosmic Compiler appreciates well-named methods
  getCurrentYear(): number {
    return new Date().getFullYear(); // Time is an illusion, but copyright dates are not
  }
}
