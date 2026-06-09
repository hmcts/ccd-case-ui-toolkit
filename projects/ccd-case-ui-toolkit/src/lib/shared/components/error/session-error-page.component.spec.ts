import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionErrorPageComponent } from './session-error-page.component';

describe('SessionErrorPageComponent', () => {
  let fixture: ComponentFixture<SessionErrorPageComponent>;
  let component: SessionErrorPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionErrorPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionErrorPageComponent);
    component = fixture.componentInstance;
  });

  it('should render default content', () => {
    fixture.detectChanges();
    const nativeEl = fixture.nativeElement as HTMLElement;

    expect(nativeEl.querySelector('h1')?.textContent).toContain(component.title);
    const paragraphs = nativeEl.querySelectorAll('p');
    expect(paragraphs[0]?.textContent).toContain(component.primaryMessage);
    expect(paragraphs[1]?.textContent).toContain(component.secondaryMessage);
  });

  it('should render provided input values', () => {
    component.title = 'Custom title';
    component.primaryMessage = 'Primary message';
    component.secondaryMessage = 'Secondary message';
    fixture.detectChanges();

    const nativeEl = fixture.nativeElement as HTMLElement;
    expect(nativeEl.querySelector('h1')?.textContent).toContain('Custom title');
    const paragraphs = nativeEl.querySelectorAll('p');
    expect(paragraphs[0]?.textContent).toContain('Primary message');
    expect(paragraphs[1]?.textContent).toContain('Secondary message');
  });
});
