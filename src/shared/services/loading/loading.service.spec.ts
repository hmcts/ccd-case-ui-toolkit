import { TestBed, waitForAsync } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let loadingService: LoadingService;
  let subscription: Subscription;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        LoadingService
      ]
    });

    loadingService = TestBed.inject(LoadingService);
  }));

  it('should return observable of true when a token is registered', waitForAsync(() => {
    loadingService.register();
    subscription = loadingService.isLoading.subscribe(value => {
      expect(value).toBeTruthy();
    });
  }));

  it('should return observable of false when all tokens are unregistered', waitForAsync(() => {
    let token1 = loadingService.register();
    let token2 = loadingService.register();

    loadingService.unregister(token1);
    loadingService.unregister(token2);

    loadingService.isLoading.subscribe(value => {
      expect(value).toBeFalsy();
    });;
  }));

  xit('should return observable of true when multiple tokens are registered, yet one is unregistered', waitForAsync(() => {
    let index = 0;
    let tokenToRemove: string;
    let interval = setInterval(() => {
      if (index === 2) {
        tokenToRemove = loadingService.register();
      } else {
        loadingService.register();
      }
      if (index > 3) {
        loadingService.unregister(tokenToRemove);
        clearInterval(interval);
        interval = undefined;
        subscription = loadingService.isLoading.subscribe(value => {
          expect(value).toBeTruthy();
        });
      }
      index++;
    }, 1);
  }));

  afterEach(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
});
