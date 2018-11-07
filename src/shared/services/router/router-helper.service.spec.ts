///<reference path="router-helper.service.ts"/>
import { RouterHelperService } from './router-helper.service';

describe('CaseEditSubmitComponent', () => {
  let classUnderTest: RouterHelperService;

  let mockRoute: any = {
    pathFromRoot: [
      {
        url: [
          {
            path: 'http://some.path'
          },
        ]
      },
      {
        url: [
          {
            path: 'http://some.other.path'
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    classUnderTest = new RouterHelperService();
  });

  it('should delegate navigateToPage calls to caseEditComponent', () => {
    let result: string[] = classUnderTest.getUrlSegmentsFromRoot(mockRoute);
    expect(result.length).toBe(2);
  });
});
