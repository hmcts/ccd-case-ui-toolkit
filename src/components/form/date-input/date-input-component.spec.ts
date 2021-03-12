import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DateInputComponent } from './date-input.component';
import { DebugElement } from '@angular/core';
import { PaletteUtilsModule } from '../../../shared/components/palette/utils/utils.module';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MockComponent } from 'ng2-mock-component';
import createSpy = jasmine.createSpy;

describe('Date input component', function () {

    let fixture: ComponentFixture<DateInputComponent>;
    let component: DateInputComponent;
    let de: DebugElement;

    let Input: any;
    let onChange;

    beforeEach(async(() => {
        // Input is mocked so that one-way bound inputs can be tested
        Input = MockComponent({
            selector: 'input', inputs: [
                'type',
                'value',
                'change',
                'keyup',
                'disabled'
            ]
        });
        TestBed
            .configureTestingModule({
                imports: [
                    ReactiveFormsModule,
                    PaletteUtilsModule
                ],
                declarations: [
                    DateInputComponent,

                    // Mock
                    Input
                ],
                providers: []
            })
            .compileComponents();

        fixture = TestBed.createComponent(DateInputComponent);
        component = fixture.componentInstance;
        onChange = createSpy('onChange');

        component.registerOnChange(onChange);

        de = fixture.debugElement;
        fixture.detectChanges();
    }));

    it('should valid when date value', async () => {
        component.id = 'dateField'
        component.writeValue('2021-04-09T08:02:27.542');
        fixture.detectChanges();
        let monthInput = await de.query(By.css(`#${component.monthId()}`)).componentInstance;
        expect(monthInput.value).toBe('04');
        let dayInput = await de.query(By.css(`#${component.dayId()}`)).componentInstance;
        expect(dayInput.value).toBe('09');
        let yearInput = await de.query(By.css(`#${component.yearId()}`)).componentInstance;
        expect(yearInput.value).toBe('2021');
    });
    it('should be valid when date', () => {
        let results = component.validate({ value: '2018-04-09T08:02:27.542' } as FormControl);
        expect(results).toBeUndefined();
    });

    it('should be invalid when invalid date pattern', () => {
        let results = component.validate({ value: 'x' } as FormControl);
        expect(results['pattern']).toBeTruthy();
    });

    it('should not be valid when empty string and mandatory', () => {
        component.mandatory = true;
        let results = component.validate({ value: '' } as FormControl);
        expect(results).toEqual({ required: 'This field is required' });
    });

    it('should be valid when null', () => {
        let results = component.validate({ value: null } as FormControl);
        expect(results).toBeUndefined();
    });

    it('should not be valid when null and mandatory', () => {
        component.mandatory = true;
        let results = component.validate({ value: null } as FormControl);
        expect(results).toEqual({ required: 'This field is required' });
    });

    describe('day input component', function () {
        it('should be valid when day value', async () => {
            component.id = 'dayInput';
            component.dayChange('09');
            component.displayDay = '09'
            fixture.detectChanges();
            let input = await de.query(By.css(`#${component.dayId()}`)).componentInstance;
            expect(input.value).toBe('09');
        });
        it('should be valid when null', async () => {
            component.id = 'dayInput';
            component.dayChange(null);
            component.displayDay = null;
            fixture.detectChanges();
            let input = await de.query(By.css(`#${component.dayId()}`)).componentInstance;
            expect(input.value).toBeNull();
        });
    })
    describe('month input component', function () {
        it('should valid when month value', async () => {
            component.id = 'monthInput';
            component.monthChange('04');
            component.displayMonth = '04'
            fixture.detectChanges();
            let input = await de.query(By.css(`#${component.monthId()}`)).componentInstance;
            expect(input.value).toBe('04');
        });
        it('should be valid when null', async () => {
            component.id = 'monthInput';
            component.monthChange(null);
            component.displayMonth = null;
            fixture.detectChanges();
            let input = await de.query(By.css(`#${component.monthId()}`)).componentInstance;
            expect(input.value).toBeNull();
        });
    })
    describe('year input component', function () {

        it('should valid when year value', async () => {
            component.id = 'yearInput';
            component.yearChange('2021');
            component.displayYear = '2021'
            fixture.detectChanges();
            let input = await de.query(By.css(`#${component.yearId()}`)).componentInstance;
            expect(input.value).toBe('2021');
        });

        it('should be valid when null', async () => {
            component.id = 'yearInput';
            component.yearChange(null);
            component.displayYear = null;
            fixture.detectChanges();
            let input = await de.query(By.css(`#${component.yearId()}`)).componentInstance;
            expect(input.value).toBeNull();
        });
    })
});
