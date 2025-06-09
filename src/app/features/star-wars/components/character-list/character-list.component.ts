import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
      <mat-card class="tw-mb-4">
        <mat-card-header>
          <mat-card-title>Luke Skywalker</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>A placeholder for our future Star Wars character data</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button>VIEW DETAILS</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
})
export class CharacterListComponent {}
