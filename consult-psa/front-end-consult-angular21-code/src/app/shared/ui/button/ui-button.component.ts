import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, ButtonDirective, type ButtonSeverity } from 'primeng/button';

type ButtonType = 'button' | 'submit' | 'reset';
type ButtonVariant = 'text' | 'outlined' | 'link';
type ButtonSize = 'small' | 'large';
type IconPosition = 'left' | 'right' | 'top' | 'bottom';

@Component({
  selector: 'app-ui-button',
  imports: [Button, ButtonDirective, RouterLink],
  templateUrl: './ui-button.component.html',
  styleUrl: './ui-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiButtonComponent {
  readonly label = input<string | undefined>(undefined);
  readonly icon = input<string | undefined>(undefined);
  readonly iconPos = input<IconPosition | undefined>(undefined);
  readonly severity = input<ButtonSeverity | undefined>(undefined);
  readonly variant = input<ButtonVariant | undefined>(undefined);
  readonly size = input<ButtonSize | undefined>(undefined);

  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);

  readonly to = input<string | readonly unknown[] | null>(null);

  readonly clicked = output<MouseEvent>();

  onAnchorClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit(event);
  }
}
