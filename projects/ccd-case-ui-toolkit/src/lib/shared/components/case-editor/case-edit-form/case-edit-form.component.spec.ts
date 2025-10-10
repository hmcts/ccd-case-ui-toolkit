import { Subject, Subscription } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { CaseEditFormComponent } from './case-edit-form.component';
import { EventEmitter } from '@angular/core';

// Mock FormValueService
class MockFormValueService {
    sanitise(value: any) {
        return value;
    }
}

describe('CaseEditFormComponent', () => {
    let component: CaseEditFormComponent;
    let formValueService: MockFormValueService;
    let formGroup: FormGroup;

    beforeEach(() => {
        formValueService = new MockFormValueService();
        formGroup = new FormGroup({
            field1: new FormControl('value1'),
            field2: new FormControl('value2')
        });
        component = new CaseEditFormComponent(formValueService as any);
        component.formGroup = formGroup;
        component.pageChangeSubject = new Subject<boolean>();
        component.valuesChanged = new EventEmitter<any>();
    });

    describe('ngOnDestroy', () => {
        it('should unsubscribe from subscriptions if present', () => {
            let unsubscribed1 = false;
            let unsubscribed2 = false;
            component.pageChangeSubscription = { unsubscribe: () => { unsubscribed1 = true; } } as Subscription;
            component.formGroupChangeSubscription = { unsubscribe: () => { unsubscribed2 = true; } } as Subscription;
            component.ngOnDestroy();
            expect(unsubscribed1).toBe(true);
            expect(unsubscribed2).toBe(true);
        });

        it('should not throw if subscriptions are undefined', () => {
            component.pageChangeSubscription = undefined;
            component.formGroupChangeSubscription = undefined;
            expect(() => component.ngOnDestroy()).not.toThrow();
        });
    });

    describe('retrieveInitialFormValues', () => {
        it('should set initial to stringified sanitised form value', () => {
            component.retrieveInitialFormValues();
            expect(component.initial).toEqual(JSON.stringify(formGroup.value));
        });
    });

    describe('deepEqual', () => {
        it('should return true for equal primitives', () => {
            expect((component as any).deepEqual(1, 1)).toBe(true);
            expect((component as any).deepEqual('a', 'a')).toBe(true);
        });

        it('should return false for different primitives', () => {
            expect((component as any).deepEqual(1, 2)).toBe(false);
            expect((component as any).deepEqual('a', 'b')).toBe(false);
        });

        it('should return true for deeply equal objects', () => {
            const obj1 = { a: 1, b: { c: 2 } };
            const obj2 = { a: 1, b: { c: 2 } };
            expect((component as any).deepEqual(obj1, obj2)).toBe(true);
        });

        it('should return false for objects with different keys', () => {
            const obj1 = { a: 1 };
            const obj2 = { b: 1 };
            expect((component as any).deepEqual(obj1, obj2)).toBe(false);
        });

        it('should return false for objects with different values', () => {
            const obj1 = { a: 1 };
            const obj2 = { a: 2 };
            expect((component as any).deepEqual(obj1, obj2)).toBe(false);
        });

        it('should return false if one is null', () => {
            expect((component as any).deepEqual(null, {})).toBe(false);
            expect((component as any).deepEqual({}, null)).toBe(false);
        });
    });

    describe('detectChangesAndEmit', () => {
        it('should emit false if values are equal', (done) => {
            component.initial = formGroup.value;
            component.valuesChanged.subscribe((changed) => {
                expect(changed).toBe(false);
                done();
            });
            component.detectChangesAndEmit(formGroup.value);
        });

        it('should emit true if values are not equal', (done) => {
            component.initial = { field1: 'value1', field2: 'value2' };
            component.valuesChanged.subscribe((changed) => {
                expect(changed).toBe(true);
                done();
            });
            component.detectChangesAndEmit({ field1: 'changed', field2: 'value2' });
        });
    });

    describe('subscribeToFormChanges', () => {
        it('should subscribe to formGroup.valueChanges and call detectChangesAndEmit', (done) => {
            let called = false;
            component.detectChangesAndEmit = () => {
                called = true;
                done();
            };
            component.subscribeToFormChanges();
            formGroup.setValue({ field1: 'new', field2: 'value2' });
            setTimeout(() => {
                expect(called).toBe(true);
            }, 250);
        });
    });

    describe('ngAfterViewInit', () => {
        it('should call retrieveInitialFormValues and subscribe to pageChangeSubject', (done) => {
            let retrieveCalled = 0;
            component.retrieveInitialFormValues = () => { retrieveCalled++; };
            component.subscribeToFormChanges = () => {};
            component.ngAfterViewInit();
            component.pageChangeSubject.next(true);
            setTimeout(() => {
                expect(retrieveCalled).toBeGreaterThan(1);
                done();
            }, 10);
        });
    });
});
