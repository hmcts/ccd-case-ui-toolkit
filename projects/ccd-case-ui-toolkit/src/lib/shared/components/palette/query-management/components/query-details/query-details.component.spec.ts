import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionStorageService } from '../../../../../services';
import { QueryDetailsComponent } from './query-details.component';

describe('QueryDetailsComponent', () => {
  let component: QueryDetailsComponent;
  let fixture: ComponentFixture<QueryDetailsComponent>;
  const mockSessionStorageService = jasmine.createSpyObj<SessionStorageService>('SessionStorageService', ['getItem']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryDetailsComponent ],
      providers: [ {provide: SessionStorageService, useValue: mockSessionStorageService } ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit event on clcking back to queries', () => {
    spyOn(component.backClicked, 'emit');
    component.onBack();
    expect(component.backClicked.emit).toHaveBeenCalled();
  });

  describe('isCaseworker', () => {
    const USER = {
      roles: [
        'caseworker'
      ]
    };

    it('should return true if the user doesnt have pui-case-manager', () => {
      mockSessionStorageService.getItem.and.returnValue(JSON.stringify(USER));
      fixture.detectChanges();
      expect(component.isCaseworker()).toBeTruthy();
    });

    it('should return true if the user doesnt have pui-case-manager', () => {
      USER.roles.push('pui-case-manager');
      mockSessionStorageService.getItem.and.returnValue(JSON.stringify(USER));
      fixture.detectChanges();
      expect(component.isCaseworker()).toBeFalsy();
      USER.roles.pop();
    });

    it('should return true if the user doesnt have pui-case-manager', () => {
      USER.roles.push('Civil-Judge');
      mockSessionStorageService.getItem.and.returnValue(JSON.stringify(USER));
      fixture.detectChanges();
      expect(component.isCaseworker()).toBeFalsy();
    });
  })
});
