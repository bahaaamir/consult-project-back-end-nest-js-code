import { TestBed } from '@angular/core/testing';

import { UiButtonComponent } from './ui-button.component';

describe(UiButtonComponent.name, () => {
  it('emits clicked when pressed', async () => {
    await TestBed.configureTestingModule({
      imports: [UiButtonComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(UiButtonComponent);
    fixture.componentRef.setInput('label', 'Click me');
    fixture.detectChanges();

    let clicked = 0;
    fixture.componentInstance.clicked.subscribe(() => {
      clicked += 1;
    });

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement | null;
    expect(button).toBeTruthy();
    button?.click();

    expect(clicked).toBe(1);
  });
});

