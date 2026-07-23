import { MODES, Utils } from './index';

describe('Activity Utils', () => {
  it('should retain the socket mode values used by LaunchDarkly', () => {
    expect(MODES.socket).toBe('socket');
    expect(MODES.socketLongPoll).toBe('socket-long-poll');
  });

  it('should generate the existing case activity descriptions', () => {
    const activity = {
      viewers: [{ id: '1', forename: 'Alex', surname: 'Smith' }],
      unknownViewers: 0,
      editors: [],
      unknownEditors: 0
    };

    expect(Utils.activity.viewersDescription(activity as any)).toBe('Alex Smith is viewing this case');
  });
});
