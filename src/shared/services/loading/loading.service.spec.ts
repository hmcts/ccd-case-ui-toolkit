import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { LoadingService } from './loading.service';


describe('LoadingService', () => {
  let loadingService: LoadingService;
  let subscription: Subscription;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        LoadingService
      ]
    });

    loadingService = TestBed.get(LoadingService);
  });

  it('should return observable of true when a token is registered', () => {
    
    loadingService.register();
    subscription = loadingService.isLoading.subscribe(value => {
      expect(value).toBeTruthy();
    });

  });

  it('should return observable of false as default', () => {

    subscription = loadingService.isLoading.subscribe(value => {
      expect(value).toBeFalsy();
    });

  });

  it('should return observable of false when a tokens are unregistered', () => {

    const token1 = loadingService.register();
    const token2 = loadingService.register();
    loadingService.unregister(token1);
    loadingService.unregister(token2);
    subscription = loadingService.isLoading.subscribe(value => {
      expect(value).toBeFalsy();
    });

  });

  it('should return observable of true when multiple tokens are registered, yet one is unregistered', () => {

    loadingService.register();
    loadingService.register();
    const token = loadingService.register();
    loadingService.register();
    loadingService.unregister(token);
    subscription = loadingService.isLoading.subscribe(value => {
      expect(value).toBeTruthy();
    });

  });

  afterEach(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
});
