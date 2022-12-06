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
    const hrefMarkdownLinkContent = '/case/IA/Asylum/1632395877596617/trigger/addCaseNote';
    store.updateHrefLink(hrefMarkdownLinkContent);
    store.getHrefMarkdownLinkContent().subscribe(res => {
      expect(res).toBe(hrefMarkdownLinkContent);
    });
  }));

  it('should call callAngularRouter() without queryParams', async(() => {
    const hrefMarkdownLinkContent = '/case/IA/Asylum/1632395877596617/trigger/addCaseNote';
    store.callAngularRouter(hrefMarkdownLinkContent);
    expect(router.navigate).toHaveBeenCalledWith([hrefMarkdownLinkContent], {
      queryParams: ''
    });
  }));

  it('should call callAngularRouter() with multiple queryParams', async(() => {
    const hrefMarkdownLinkContent = '/role-access/allocate-role/allocate?caseId=1652-7000-9981-7227&roleCategory=JUDICIAL&jurisdiction=IA&tid=d8f01ae1-d51b-11ec-bd5d-2aeb959399b9';
    store.callAngularRouter(hrefMarkdownLinkContent);
    expect(router.navigate).toHaveBeenCalledWith(['/role-access/allocate-role/allocate'], {queryParams: {caseId: '1652-7000-9981-7227',
    roleCategory: 'JUDICIAL',
    jurisdiction: 'IA',
    tid: 'd8f01ae1-d51b-11ec-bd5d-2aeb959399b9'}});
  }));

  it('should call callAngularRouter() with single queryParams', async(() => {
    const hrefMarkdownLinkContent = '/role-access/allocate-role/allocate?caseId=1652-7000-9981-7227';
    store.callAngularRouter(hrefMarkdownLinkContent);
    expect(router.navigate).toHaveBeenCalledWith(['/role-access/allocate-role/allocate'], {queryParams: {caseId: '1652-7000-9981-7227'}});
  }));

  it('should call callAngularRouter() with no queryParams', async(() => {
    const hrefMarkdownLinkContent = '/role-access/allocate-role/allocate?&';
    store.callAngularRouter(hrefMarkdownLinkContent);
    expect(router.navigate).toHaveBeenCalledWith([  '/role-access/allocate-role/allocate' ], { queryParams: '' } );
  }));
});
