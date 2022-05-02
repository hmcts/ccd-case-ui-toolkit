import { TestBed, async } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ConvertHrefToRouterService } from './convert-href-to-router.service';
describe('ConvertHrefToRouterService', () => {
  let store: ConvertHrefToRouterService
  let router = {
          navigate: jasmine.createSpy('navigate'),
        };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConvertHrefToRouterService,
        { provide: Router, useValue: router }
      ],
    })
    store = TestBed.get(ConvertHrefToRouterService);
  });

  it('get href markdown link', async(() => {
    const mockData = 'abcd';

    store.updateHrefLink(mockData);
    store.getHrefMarkdownLinkContent().subscribe(res => {
      expect(res).toBe(mockData);
    });
  }));
});
