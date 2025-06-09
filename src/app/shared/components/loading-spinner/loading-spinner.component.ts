import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="tw-flex tw-justify-center tw-items-center tw-p-4" [class.tw-h-full]="fullHeight">
      <mat-spinner [diameter]="diameter" [color]="color"></mat-spinner>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() diameter = 50;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() fullHeight = false;
}
