import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { UiInputTextComponent } from './ui-input-text.component';

@Component({
  selector: 'app-host',
  imports: [ReactiveFormsModule, UiInputTextComponent],
  template: `<form [formGroup]="form"><app-ui-input-text label="Name" formControlName="name" /></form>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class HostComponent {
  readonly form = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
  });
}

describe(UiInputTextComponent.name, () => {
  it('shows required error after touch', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.markAllAsTouched();
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.ui-field__error') as HTMLElement | null;
    expect(error?.textContent).toContain('required');
  });
});

