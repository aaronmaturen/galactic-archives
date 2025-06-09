import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  log(message: string): void {
    console.log(`[Galactic Archives] ${message}`);
  }

  error(message: string): void {
    console.error(`[Galactic Archives] ${message}`);
  }
}
