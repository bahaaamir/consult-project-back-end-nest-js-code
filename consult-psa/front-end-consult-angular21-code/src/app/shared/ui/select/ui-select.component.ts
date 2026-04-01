import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule, NgControl, type ControlValueAccessor } from '@angular/forms';
import { Select } from 'primeng/select';

import { nextId } from '../../utils/ids';

type SelectOption = Record<string, unknown> | string | number | boolean | null;

@Component({
  selector: 'app-ui-select',
  imports: [Select, FormsModule],
  templateUrl: './ui-select.component.html',
  styleUrl: './ui-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiSelectComponent implements ControlValueAccessor {
  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly helpText = input<string | undefined>(undefined);

  readonly options = input<SelectOption[]>([]);
  readonly optionLabel = input<string | undefined>(undefined);
  readonly optionValue = input<string | undefined>(undefined);

  readonly value = signal<unknown>(null);
  readonly disabled = signal(false);

  readonly inputId = nextId('ui-select');
  readonly helpId = `${this.inputId}-help`;
  readonly errorId = `${this.inputId}-error`;

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private onChange: (value: unknown) => void = () => {};
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
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onModelChange(value: unknown): void {
    this.value.set(value);
    this.onChange(value);
  }

  markTouched(): void {
    this.onTouched();
  }
}
