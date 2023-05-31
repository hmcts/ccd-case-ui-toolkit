import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { QueryCaseDetailsHeaderComponent } from './query-case-details-header.component';

@Pipe({ name: 'rpxTranslate' })
class MockTranslatePipe implements PipeTransform {
  public transform(value: string, ...args: any[]) {
    return value;
  }
}

@Pipe({ name: 'ccdCaseReference' })
class MockCaseReferencePipe implements PipeTransform {
  public transform(value: string, ...args: any[]) {
    return value;
  }
}

describe('QueryCaseDetailsHeaderComponent', () => {
  let component: QueryCaseDetailsHeaderComponent;
  let fixture: ComponentFixture<QueryCaseDetailsHeaderComponent>;

  beforeEach(async () => {
    const snapshotActivatedRoute = { data: { case: { case_id: '123', title_display: 'TitleDisplay' } } };
    await TestBed.configureTestingModule({
      declarations: [ QueryCaseDetailsHeaderComponent, MockCaseReferencePipe ],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot:  snapshotActivatedRoute } },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryCaseDetailsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
