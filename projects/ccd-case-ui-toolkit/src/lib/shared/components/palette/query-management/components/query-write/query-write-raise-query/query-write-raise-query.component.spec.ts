import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pipe, PipeTransform } from '@angular/core';
import { QueryWriteRaiseQueryComponent } from './query-write-raise-query.component';

@Pipe({ name: 'rpxTranslate' })
class MockRpxTranslatePipe implements PipeTransform {
  public transform(value: string, ...args: any[]) {
    return value;
  }
}

describe('QueryWriteRaiseQueryComponent', () => {
  let component: QueryWriteRaiseQueryComponent;
  let fixture: ComponentFixture<QueryWriteRaiseQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryWriteRaiseQueryComponent, MockRpxTranslatePipe ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryWriteRaiseQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
