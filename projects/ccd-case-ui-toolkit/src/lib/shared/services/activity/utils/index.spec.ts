import { Utils } from './index';

describe('Activity Utils', () => {
  const user = { id: 'abcdefg123456' };

  describe('getOptions', () => {
    it('should enable bounded-backoff Socket.IO reconnection for websocket mode', () => {
      const options = Utils.getOptions(user, true);

      expect(options.reconnection).toBe(true);
      expect(options.reconnectionAttempts).toBe(Infinity);
      expect(options.reconnectionDelay).toBe(1000);
      expect(options.reconnectionDelayMax).toBe(10000);
      expect(options.randomizationFactor).toBe(0.5);
      expect(options.timeout).toBe(20000);
      expect(options.transports).toEqual(['websocket']);
      expect(options.upgrade).toBe(true);
      expect(options.auth).toEqual({ user });
      expect(options.query).toBeUndefined();
    });

    it('should keep Socket.IO auto-reconnection enabled for long-poll socket mode', () => {
      const options = Utils.getOptions(user, false);

      expect(options.reconnection).toBe(true);
      expect(options.transports).toEqual(['polling']);
      expect(options.upgrade).toBe(false);
    });
  });
});
