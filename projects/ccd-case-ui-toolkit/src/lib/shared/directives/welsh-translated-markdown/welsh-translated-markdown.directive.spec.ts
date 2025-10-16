import {
  Component,
  Input
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { TranslatedMarkdownDirective } from './welsh-translated-markdown.directive';
import { RpxTranslationService } from 'rpx-xui-translation';

// Mock translation service
class MockRpxTranslationService {
  private langSubject = new BehaviorSubject<string>('en');
  language$ = this.langSubject.asObservable();
  get language() {
    return this.langSubject.value;
  }

  setLanguage(lang: string) {
    this.langSubject.next(lang);
  }
}

// Host component to test directive integration
@Component({
    selector: 'test-host',
  template: `
    <ng-container *translatedMarkdown="question; let content">
      <p class="output">{{ content }}</p>
    </ng-container>
  `,
  standalone: false
})
class TestHostComponent {
  @Input() question: any = {
    markdown: 'Hello in English',
    markdown_cy: 'Shwmae yn Gymraeg'
  };
}

describe('TranslatedMarkdownDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let mockTranslationService: MockRpxTranslationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TranslatedMarkdownDirective, TestHostComponent],
      providers: [
        { provide: RpxTranslationService, useClass: MockRpxTranslationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    mockTranslationService = TestBed.inject(RpxTranslationService) as any;
  });

  it('should display English markdown by default', () => {
    fixture.detectChanges();
    const output = fixture.nativeElement.querySelector('.output').textContent.trim();
    expect(output).toBe('Hello in English');
  });

  it('should display Welsh markdown when language is "cy"', () => {
    mockTranslationService.setLanguage('cy');
    fixture.detectChanges();

    const output = fixture.nativeElement.querySelector('.output').textContent.trim();
    expect(output).toBe('Shwmae yn Gymraeg');
  });

  it('should fall back to English if markdown_cy is missing', () => {
    component.question = {
      markdown: 'Fallback English',
      markdown_cy: null
    };

    mockTranslationService.setLanguage('cy');
    fixture.detectChanges();

    const output = fixture.nativeElement.querySelector('.output').textContent.trim();
    expect(output).toBe('Fallback English');
  });

  it('should update content when language changes dynamically', () => {
    fixture.detectChanges();
    let output = fixture.nativeElement.querySelector('.output').textContent.trim();
    expect(output).toBe('Hello in English');

    mockTranslationService.setLanguage('cy');
    fixture.detectChanges();

    output = fixture.nativeElement.querySelector('.output').textContent.trim();
    expect(output).toBe('Shwmae yn Gymraeg');
  });
});
