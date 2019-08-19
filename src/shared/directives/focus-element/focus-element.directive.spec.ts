import { FocusElementDirective } from './focus-element.directive';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <input type='text' id='firstName' name='firstName'>
    <input type='text' id='lastName' name='lastName' focusElement>
    <input type='text' id='postcode' name='postcode'>`
})
class TestFocusComponent {
}

describe('FocusElementDirective', () => {

  let comp: TestFocusComponent;
  let fixture: ComponentFixture<TestFocusComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FocusElementDirective, TestFocusComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestFocusComponent);
    comp = fixture.componentInstance;
    de = fixture.debugElement.query(By.directive(FocusElementDirective));
    el = de.nativeElement;
  });

  it('should focus input element', () => {
    spyOn(el, 'focus');
    fixture.detectChanges();

    expect(el.focus).toHaveBeenCalled();
  });

});
