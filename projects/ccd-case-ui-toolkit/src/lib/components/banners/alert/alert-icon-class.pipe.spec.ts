import { AlertIconClassPipe } from './alert-icon-class.pipe';
import { AlertComponent } from './alert.component';

describe('AlertIconClassPipe', () => {
  let pipe: AlertIconClassPipe;
  describe('transform', () => {
    it('should return icon-tick', () => {
      pipe = new AlertIconClassPipe();

      const actual = pipe.transform(AlertComponent.TYPE_SUCCESS);

      expect(actual).toEqual('icon-tick');
    });

    it('should return icon-alert', () => {
      pipe = new AlertIconClassPipe();

      const actual = pipe.transform(AlertComponent.TYPE_WARNING);

      expect(actual).toEqual('icon-alert');
    });
  });
});
