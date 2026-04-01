import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-page-header',
  templateUrl: './ui-page-header.component.html',
  styleUrl: './ui-page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiPageHeaderComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string | undefined>(undefined);
}

