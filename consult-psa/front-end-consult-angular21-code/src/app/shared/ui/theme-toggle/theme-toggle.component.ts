import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  readonly mode = this.themeService.mode;
  readonly nextModeLabel = computed(() => (this.mode() === 'dark' ? 'Light' : 'Dark'));

  toggle(): void {
    this.themeService.toggle();
  }
}

