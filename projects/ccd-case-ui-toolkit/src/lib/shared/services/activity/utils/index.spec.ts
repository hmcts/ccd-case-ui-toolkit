import { Utils } from './index';

describe('Activity Utils', () => {
  const user = { id: 'abcdefg123456' };

  describe('getOptions', () => {
    it('should disable Socket.IO auto-reconnection for websocket mode only', () => {
      const options = Utils.getOptions(user, true);

      expect(options.reconnection).toBe(false);
      expect(options.transports).toEqual(['websocket']);
      expect(options.upgrade).toBe(true);
    });

    it('should keep Socket.IO auto-reconnection enabled for long-poll socket mode', () => {
      const options = Utils.getOptions(user, false);

      expect(options.reconnection).toBe(true);
      expect(options.transports).toEqual(['polling']);
      expect(options.upgrade).toBe(false);
    });
  });
});
