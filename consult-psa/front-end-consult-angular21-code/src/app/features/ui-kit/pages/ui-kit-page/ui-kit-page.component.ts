import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';
import { UiCardComponent } from '../../../../shared/ui/card/ui-card.component';
import { UiInputTextComponent } from '../../../../shared/ui/input-text/ui-input-text.component';
import { UiPageHeaderComponent } from '../../../../shared/ui/page-header/ui-page-header.component';
import { UiSelectComponent } from '../../../../shared/ui/select/ui-select.component';

type CountryOption = { code: string; name: string };

@Component({
  selector: 'app-ui-kit-page',
  imports: [
    ReactiveFormsModule,
    UiPageHeaderComponent,
    UiCardComponent,
    UiButtonComponent,
    UiInputTextComponent,
    UiSelectComponent
  ],
  templateUrl: './ui-kit-page.component.html',
  styleUrl: './ui-kit-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiKitPageComponent {
  readonly form = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    country: new FormControl<string | null>(null, { validators: [Validators.required] })
  });

  readonly submitting = signal(false);

  readonly countries: CountryOption[] = [
    { code: 'EG', name: 'Egypt' },
    { code: 'US', name: 'United States' },
    { code: 'DE', name: 'Germany' }
  ];

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    try {
      await new Promise((r) => setTimeout(r, 350));
      this.form.reset({ name: '', country: null });
    } finally {
      this.submitting.set(false);
    }
  }
}
