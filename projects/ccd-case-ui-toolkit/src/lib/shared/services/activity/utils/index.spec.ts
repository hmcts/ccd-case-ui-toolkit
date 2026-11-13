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

  it('should remove the current user by uid without removing other users', () => {
    const activity = {
      viewers: [
        { id: 'current-user', forename: 'Current', surname: 'User' },
        { id: 'other-user', forename: 'Other', surname: 'Viewer' }
      ],
      unknownViewers: 0,
      editors: [
        { id: 'current-user', forename: 'Current', surname: 'User' },
        { id: 'other-editor', forename: 'Other', surname: 'Editor' }
      ],
      unknownEditors: 0
    };

    const result = Utils.activity.stripUserFromActivity(activity as any, { uid: 'current-user' });

    expect(result.viewers).toEqual([{ id: 'other-user', forename: 'Other', surname: 'Viewer' }]);
    expect(result.editors).toEqual([{ id: 'other-editor', forename: 'Other', surname: 'Editor' }]);
  });

  it('should match all current-user identifiers without case sensitivity', () => {
    const activity = {
      viewers: [{ id: 'SSCS-dwp-cw4@justice.gov.uk', forename: 'Current', surname: 'User' }],
      unknownViewers: 0,
      editors: [{ id: ' current-user-id ', forename: 'Current', surname: 'User' }],
      unknownEditors: 0
    };

    const result = Utils.activity.stripUserFromActivity(
      activity as any,
      {
        uid: 'CURRENT-USER-ID',
        id: 'different-idam-identifier',
        email: 'sscs-dwp-cw4@justice.gov.uk'
      }
    );

    expect(result.viewers).toEqual([]);
    expect(result.editors).toEqual([]);
  });
});
