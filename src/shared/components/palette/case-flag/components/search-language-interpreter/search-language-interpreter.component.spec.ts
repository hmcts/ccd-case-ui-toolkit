import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { SearchLanguageInterpreterComponent } from "./search-language-interpreter.component";

describe('SearchLanguageInterpreterComponent', () => {
	let component: SearchLanguageInterpreterComponent;
	let fixture: ComponentFixture<SearchLanguageInterpreterComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			declarations: [SearchLanguageInterpreterComponent]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SearchLanguageInterpreterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
