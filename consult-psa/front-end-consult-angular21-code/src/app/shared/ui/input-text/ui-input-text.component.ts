import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NgControl, type ControlValueAccessor } from '@angular/forms';
import { InputText } from 'primeng/inputtext';

import { nextId } from '../../utils/ids';

type InputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

@Component({
  selector: 'app-ui-input-text',
  imports: [InputText],
  templateUrl: './ui-input-text.component.html',
  styleUrl: './ui-input-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiInputTextComponent implements ControlValueAccessor {
  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly helpText = input<string | undefined>(undefined);
  readonly type = input<InputType>('text');
  readonly autocomplete = input<string | undefined>(undefined);

  readonly value = signal<string>('');
  readonly disabled = signal(false);

  readonly inputId = nextId('ui-input');
  readonly helpId = `${this.inputId}-help`;
  readonly errorId = `${this.inputId}-error`;

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isInvalid = computed(() => {
    const control = this.ngControl?.control;
    return !!control && control.invalid && (control.touched || control.dirty);
  });

  readonly errorText = computed(() => {
    const control = this.ngControl?.control;
    if (!control || !this.isInvalid()) return undefined;
    const errors = control.errors;
    if (!errors) return 'Invalid value.';
    if (errors['required']) return 'This field is required.';
    if (errors['email']) return 'Enter a valid email address.';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}.`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength}.`;
    return 'Invalid value.';
  });

  readonly describedBy = computed(() => {
    const ids: string[] = [];
    if (this.helpText()) ids.push(this.helpId);
    if (this.errorText()) ids.push(this.errorId);
    return ids.length ? ids.join(' ') : null;
  });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  markTouched(): void {
    this.onTouched();
  }
}
