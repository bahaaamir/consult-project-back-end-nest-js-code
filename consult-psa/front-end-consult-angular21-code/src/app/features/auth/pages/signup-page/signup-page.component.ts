import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../../core/auth/auth.service';
import { AuthStore } from '../../../../core/auth/store/auth.store';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';
import { UiCardComponent } from '../../../../shared/ui/card/ui-card.component';
import { UiInputTextComponent } from '../../../../shared/ui/input-text/ui-input-text.component';
import { UiPageHeaderComponent } from '../../../../shared/ui/page-header/ui-page-header.component';

@Component({
  selector: 'app-signup-page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    UiPageHeaderComponent,
    UiCardComponent,
    UiInputTextComponent,
    UiButtonComponent,
  ],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupPageComponent {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);

  readonly submitting = this.authStore.isSubmitting;
  readonly authError = this.authStore.error;

  readonly form = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    company_name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.clearError();
    await this.authService.registerOwner(this.form.getRawValue());
  }
}
