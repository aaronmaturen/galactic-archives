import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule],
  template: `
    <div class="tw-container tw-mx-auto tw-p-4">
      <mat-card class="tw-mb-6">
        <mat-card-header>
          <mat-card-title class="tw-text-2xl">Welcome to the Galactic Archives</mat-card-title>
        </mat-card-header>
        <mat-card-content class="tw-py-4">
          <p class="tw-mb-4">Your ultimate source for Star Wars data across the galaxy.</p>
          <p>
            Explore the vast collection of characters, planets, starships, and more from the Star
            Wars universe.
          </p>
        </mat-card-content>
        <mat-card-actions>
          <a mat-raised-button color="primary" routerLink="/characters">View Characters</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
})
export class HomeComponent {}
