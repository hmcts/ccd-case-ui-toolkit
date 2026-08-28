import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ReadStaffUserFieldComponent } from './read-staff-user-field.component';
import { CaseworkerService } from '../../case-editor/services/case-worker.service';
import { JurisdictionService } from '../../../services';

describe('ReadStaffUserFieldComponent', () => {
  let fixture: ComponentFixture<ReadStaffUserFieldComponent>;
  let component: ReadStaffUserFieldComponent;
  let caseworkerService: jasmine.SpyObj<CaseworkerService>;
  let jurisdictionService: jasmine.SpyObj<JurisdictionService>;

  beforeEach(waitForAsync(() => {
    caseworkerService = jasmine.createSpyObj<CaseworkerService>(
      'CaseworkerService',
      ['getUserByIdamId']
    );

    jurisdictionService = jasmine.createSpyObj<JurisdictionService>(
      'JurisdictionService',
      ['getJudicialUserByIdamId']
    );

    TestBed.configureTestingModule({
      declarations: [ReadStaffUserFieldComponent],
      providers: [
        {
          provide: CaseworkerService,
          useValue: caseworkerService
        },
        {
          provide: JurisdictionService,
          useValue: jurisdictionService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReadStaffUserFieldComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    component.caseField = { metadata: true } as any;

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should render the caseworker display name', () => {
    caseworkerService.getUserByIdamId.and.returnValue(
      of({
        firstName: 'Alex',
        lastName: 'Staff'
      } as any)
    );

    component.caseField = {
      value: {
        idamId: '123'
      }
    } as any;

    fixture.detectChanges();

    expect(caseworkerService.getUserByIdamId).toHaveBeenCalledWith('123');
    expect(component.displayName).toBe('Alex Staff');
    expect(fixture.nativeElement.textContent).toContain('Alex Staff');
  });

  it('should render the judicial user display name when caseworker is not found', () => {
    caseworkerService.getUserByIdamId.and.returnValue(of(null));

    jurisdictionService.getJudicialUserByIdamId.and.returnValue(
      of({
        fullName: 'Alex Judge'
      } as any)
    );

    component.caseField = {
      value: {
        idamId: '123'
      }
    } as any;

    fixture.detectChanges();

    expect(caseworkerService.getUserByIdamId).toHaveBeenCalledWith('123');
    expect(jurisdictionService.getJudicialUserByIdamId)
      .toHaveBeenCalledWith('123');
    expect(component.displayName).toBe('Alex Judge');
    expect(fixture.nativeElement.textContent).toContain('Alex Judge');
  });

  it('should fall back to the judicial user when the caseworker request fails', () => {
    caseworkerService.getUserByIdamId.and.returnValue(
      throwError(() => new Error('Caseworker not found'))
    );

    jurisdictionService.getJudicialUserByIdamId.and.returnValue(
      of({
        fullName: 'Alex Judge'
      } as any)
    );

    component.caseField = {
      value: {
        idamId: '123'
      }
    } as any;

    fixture.detectChanges();

    expect(jurisdictionService.getJudicialUserByIdamId)
      .toHaveBeenCalledWith('123');
    expect(component.displayName).toBe('Alex Judge');
  });

  it('should use knownAs when judicial user fullName is not available', () => {
    caseworkerService.getUserByIdamId.and.returnValue(of(null));

    jurisdictionService.getJudicialUserByIdamId.and.returnValue(
      of({
        fullName: null,
        knownAs: 'Judge Alex'
      } as any)
    );

    component.caseField = {
      value: {
        idamId: '123'
      }
    } as any;

    fixture.detectChanges();

    expect(component.displayName).toBe('Judge Alex');
    expect(fixture.nativeElement.textContent).toContain('Judge Alex');
  });

  it('should render nothing when there is no persisted value', () => {
    component.caseField = {
      value: null
    } as any;

    fixture.detectChanges();

    expect(caseworkerService.getUserByIdamId).not.toHaveBeenCalled();
    expect(jurisdictionService.getJudicialUserByIdamId).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('should not call the services when idamId is not present', () => {
    component.caseField = {
      value: {}
    } as any;

    fixture.detectChanges();

    expect(caseworkerService.getUserByIdamId).not.toHaveBeenCalled();
    expect(jurisdictionService.getJudicialUserByIdamId).not.toHaveBeenCalled();
  });
});