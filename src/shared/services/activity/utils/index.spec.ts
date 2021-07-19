import { ManagerOptions, Socket, SocketOptions } from 'socket.io-client';

import { Utils } from '.';
import { Activity, ActivityInfo } from '../../../domain';

describe('services.activity.Utils', () => {

  const assessOptions = (options: any, expectedTransports: string[], expectedUser: object): void => {
    expect(options).toBeTruthy();
    // Base configuration
    expect(options.reconnection).toEqual(Utils.BASE_CONFIGURATION.reconnection);
    expect(options.reconnectionDelayMax).toEqual(Utils.BASE_CONFIGURATION.reconnectionDelayMax);
    expect(options.timeout).toEqual(Utils.BASE_CONFIGURATION.timeout);
    // Transports.
    assessTransports(options, expectedTransports);
    // User.
    expect(options.query).toBeTruthy();
    expect(options.query.user).toEqual(JSON.stringify(expectedUser));
  };

  const assessTransports = (options: any, expected: string[]): void => {
    expect(Array.isArray(options.transports)).toBeTruthy();
    expect(options.transports.length).toEqual(expected.length);
    expected.forEach(transport => {
      expect(options.transports.indexOf(transport)).toBeGreaterThan(-1);
    });
    expect(options.upgrade).toEqual(expected.indexOf('websocket') > -1);
  };

  describe('getTransports', () => {
    it('should handle websockets being allowed', () => {
      const transports: any = Utils.getTransports(true);
      assessTransports(transports, Utils.TRANSPORTS.allowWebSockets);
    });
    it('should handle websockets being disallowed', () => {
      const transports: any = Utils.getTransports(false);
      assessTransports(transports, Utils.TRANSPORTS.disallowWebSockets);
    });
  });

  describe('getOptions', () => {
    let user: object;
    beforeEach(() => {
      user = { id: 'BS', surname: 'Smith', forenames: 'Bob' };
    });

    it('should handle websockets being allowed', () => {
      const options: Partial<ManagerOptions & SocketOptions> = Utils.getOptions(user, true);
      assessOptions(options, Utils.TRANSPORTS.allowWebSockets, user);
    });
    it('should handle websockets being disallowed', () => {
      const options: Partial<ManagerOptions & SocketOptions> = Utils.getOptions(user, false);
      assessOptions(options, Utils.TRANSPORTS.disallowWebSockets, user);
    });
  });

  describe('getSocket', () => {
    let user: object;
    let userString: string;
    beforeEach(() => {
      user = { id: 'BS', surname: 'Smith', forenames: 'Bob' };
      userString = JSON.stringify(user);
    });
    it('should handle websockets being allowed', () => {
      const socket: Socket = Utils.getSocket(user, true);
      expect(socket instanceof Socket).toBeTruthy();
      assessOptions(socket.io.opts, Utils.TRANSPORTS.allowWebSockets, user);
      expect(socket.query).toBeDefined();
      expect(socket.query.user).toEqual(userString);
    });
    it('should handle websockets being disallowed', () => {
      const socket: Socket = Utils.getSocket(user, false);
      expect(socket instanceof Socket).toBeTruthy();
      assessOptions(socket.io.opts, Utils.TRANSPORTS.disallowWebSockets, user);
      expect(socket.query).toBeDefined();
      expect(socket.query.user).toEqual(userString);
    });
  });

  describe('activity', () => {

    const getActivityInfos = (count: number, forename: string): ActivityInfo[] => {
      const infos: ActivityInfo[] = [];
      for (let i = 0; i < count; i++) {
        infos.push({ forename, surname: `${i}` });
      }
      return infos;
    };
    const getActivity = (knownEditors: number, unknownEditors: number, knownViewers: number, unknownViewers: number): Activity => {
      return {
        caseId: 'CASE_ID',
        editors: getActivityInfos(knownEditors, 'Editor'),
        unknownEditors,
        viewers: getActivityInfos(knownViewers, 'Viewer'),
        unknownViewers
      };
    };

    describe('hasEditors', () => {
      it('should handle null activity', () => {
        expect(Utils.activity.hasEditors(null)).toEqual(false);
      });
      it('should handle undefined activity', () => {
        expect(Utils.activity.hasEditors(undefined)).toEqual(false);
      });
      it('should handle no known editors or unknown editors', () => {
        const activity: Activity = getActivity(0, 0, 1, 3);
        expect(Utils.activity.hasEditors(activity)).toEqual(false);
      });
      it('should handle one known editor and no unknown editors', () => {
        const activity: Activity = getActivity(1, 0, 0, 0);
        expect(Utils.activity.hasEditors(activity)).toEqual(true);
      });
      it('should handle no known editor and one unknown editors', () => {
        const activity: Activity = getActivity(0, 1, 0, 0);
        expect(Utils.activity.hasEditors(activity)).toEqual(true);
      });
      it('should handle known editors and unknown editors', () => {
        const activity: Activity = getActivity(3, 3, 0, 0);
        expect(Utils.activity.hasEditors(activity)).toEqual(true);
      });
    });

    describe('hasViewers', () => {
      it('should handle null activity', () => {
        expect(Utils.activity.hasViewers(null)).toEqual(false);
      });
      it('should handle undefined activity', () => {
        expect(Utils.activity.hasViewers(undefined)).toEqual(false);
      });
      it('should handle no known viewer or unknown viewers', () => {
        const activity: Activity = getActivity(1, 3, 0, 0);
        expect(Utils.activity.hasViewers(activity)).toEqual(false);
      });
      it('should handle one known viewer and no unknown viewers', () => {
        const activity: Activity = getActivity(0, 0, 1, 0);
        expect(Utils.activity.hasViewers(activity)).toEqual(true);
      });
      it('should handle no known viewer and one unknown viewers', () => {
        const activity: Activity = getActivity(0, 0, 0, 1);
        expect(Utils.activity.hasViewers(activity)).toEqual(true);
      });
      it('should handle known viewer and unknown viewers', () => {
        const activity: Activity = getActivity(0, 0, 3, 3);
        expect(Utils.activity.hasViewers(activity)).toEqual(true);
      });
    });

    describe('hasViewersOrEditors', () => {
      it('should handle null activity', () => {
        expect(Utils.activity.hasViewersOrEditors(null)).toEqual(false);
      });
      it('should handle undefined activity', () => {
        expect(Utils.activity.hasViewersOrEditors(undefined)).toEqual(false);
      });
      it('should handle no viewer or editors at all', () => {
        const activity: Activity = getActivity(0, 0, 0, 0);
        expect(Utils.activity.hasViewersOrEditors(activity)).toEqual(false);
      });
      it('should handle just a known editor', () => {
        const activity: Activity = getActivity(1, 0, 0, 0);
        expect(Utils.activity.hasViewersOrEditors(activity)).toEqual(true);
      });
      it('should handle just an unknown editor', () => {
        const activity: Activity = getActivity(0, 1, 0, 0);
        expect(Utils.activity.hasViewersOrEditors(activity)).toEqual(true);
      });
      it('should handle just a known viewer', () => {
        const activity: Activity = getActivity(0, 0, 1, 0);
        expect(Utils.activity.hasViewersOrEditors(activity)).toEqual(true);
      });
      it('should handle just an unknown viewer', () => {
        const activity: Activity = getActivity(0, 0, 0, 1);
        expect(Utils.activity.hasViewersOrEditors(activity)).toEqual(true);
      });
    });

    describe('editorsDescription', () => {
      it('should handle null activity', () => {
        expect(Utils.activity.editorsDescription(null)).toBeUndefined();
      });
      it('should handle undefined activity', () => {
        expect(Utils.activity.editorsDescription(undefined)).toBeUndefined();
      });
      it('should handle no known editors or unknown editors', () => {
        const activity: Activity = getActivity(0, 0, 1, 3);
        expect(Utils.activity.editorsDescription(activity)).toBeUndefined();
      });
      it('should handle a single unknown editor', () => {
        const activity: Activity = getActivity(0, 1, 1, 3);
        expect(Utils.activity.editorsDescription(activity)).toEqual(`${Utils.DESCRIPTIONS.EDITORS_PREFIX}1 user`);
      });
      it('should handle multiple unknown editors', () => {
        const activity: Activity = getActivity(0, 3, 1, 3);
        expect(Utils.activity.editorsDescription(activity)).toEqual(`${Utils.DESCRIPTIONS.EDITORS_PREFIX}3 users`);
      });
      it('should handle a single known editor', () => {
        const activity: Activity = getActivity(1, 0, 1, 3);
        expect(Utils.activity.editorsDescription(activity)).toEqual(`${Utils.DESCRIPTIONS.EDITORS_PREFIX}Editor 0`);
      });
      it('should handle two known editors', () => {
        const activity: Activity = getActivity(2, 0, 1, 3);
        expect(Utils.activity.editorsDescription(activity)).toEqual(`${Utils.DESCRIPTIONS.EDITORS_PREFIX}Editor 0 and Editor 1`);
      });
      it('should handle more than two known editors', () => {
        const activity: Activity = getActivity(3, 0, 1, 3);
        expect(Utils.activity.editorsDescription(activity)).toEqual(`${Utils.DESCRIPTIONS.EDITORS_PREFIX}Editor 0, Editor 1 and Editor 2`);
      });
      it('should handle a single known editor and a single unknown editor', () => {
        const activity: Activity = getActivity(1, 1, 1, 3);
        expect(Utils.activity.editorsDescription(activity)).toEqual(`${Utils.DESCRIPTIONS.EDITORS_PREFIX}Editor 0 and 1 other`);
      });
      it('should handle a single known editor and multiple unknown editors', () => {
        const activity: Activity = getActivity(1, 5, 1, 3);
        expect(Utils.activity.editorsDescription(activity)).toEqual(`${Utils.DESCRIPTIONS.EDITORS_PREFIX}Editor 0 and 5 others`);
      });
      it('should handle two known editors and multiple unknown editors', () => {
        const activity: Activity = getActivity(2, 5, 1, 3);
        expect(Utils.activity.editorsDescription(activity)).toEqual(`${Utils.DESCRIPTIONS.EDITORS_PREFIX}Editor 0, Editor 1 and 5 others`);
      });
      it('should handle more than two known editors and multiple unknown editors', () => {
        const activity: Activity = getActivity(3, 5, 1, 3);
        expect(Utils.activity.editorsDescription(activity)).toEqual(`${Utils.DESCRIPTIONS.EDITORS_PREFIX}Editor 0, Editor 1, Editor 2 and 5 others`);
      });
    });

    describe('viewersDescription', () => {
      it('should handle null activity', () => {
        expect(Utils.activity.viewersDescription(null)).toBeUndefined();
      });
      it('should handle undefined activity', () => {
        expect(Utils.activity.viewersDescription(undefined)).toBeUndefined();
      });
      it('should handle no known viewers or unknown viwers', () => {
        const activity: Activity = getActivity(1, 3, 0, 0);
        expect(Utils.activity.viewersDescription(activity)).toBeUndefined();
      });
      it('should handle a single unknown viewer', () => {
        const activity: Activity = getActivity(1, 3, 0, 1);
        expect(Utils.activity.viewersDescription(activity)).toEqual(`1 user is ${Utils.DESCRIPTIONS.VIEWERS_SUFFIX}`);
      });
      it('should handle multiple unknown viewers', () => {
        const activity: Activity = getActivity(1, 3, 0, 3);
        expect(Utils.activity.viewersDescription(activity)).toEqual(`3 users are ${Utils.DESCRIPTIONS.VIEWERS_SUFFIX}`);
      });
      it('should handle a single known viewer', () => {
        const activity: Activity = getActivity(1, 3, 1, 0);
        expect(Utils.activity.viewersDescription(activity)).toEqual(`Viewer 0 is ${Utils.DESCRIPTIONS.VIEWERS_SUFFIX}`);
      });
      it('should handle two known viewers', () => {
        const activity: Activity = getActivity(1, 3, 2, 0);
        expect(Utils.activity.viewersDescription(activity)).toEqual(`Viewer 0 and Viewer 1 are ${Utils.DESCRIPTIONS.VIEWERS_SUFFIX}`);
      });
      it('should handle more than two known viewers', () => {
        const activity: Activity = getActivity(1, 3, 3, 0);
        expect(Utils.activity.viewersDescription(activity)).toEqual(`Viewer 0, Viewer 1 and Viewer 2 are ${Utils.DESCRIPTIONS.VIEWERS_SUFFIX}`);
      });
      it('should handle a single known viewer and a single unknown viewer', () => {
        const activity: Activity = getActivity(1, 3, 1, 1);
        expect(Utils.activity.viewersDescription(activity)).toEqual(`Viewer 0 and 1 other are ${Utils.DESCRIPTIONS.VIEWERS_SUFFIX}`);
      });
      it('should handle a single known viewer and multiple unknown viewers', () => {
        const activity: Activity = getActivity(1, 3, 1, 5);
        expect(Utils.activity.viewersDescription(activity)).toEqual(`Viewer 0 and 5 others are ${Utils.DESCRIPTIONS.VIEWERS_SUFFIX}`);
      });
      it('should handle two known viewers and multiple unknown viewers', () => {
        const activity: Activity = getActivity(1, 3, 2, 5);
        expect(Utils.activity.viewersDescription(activity)).toEqual(`Viewer 0, Viewer 1 and 5 others are ${Utils.DESCRIPTIONS.VIEWERS_SUFFIX}`);
      });
      it('should handle more than two known viewers and multiple unknown viewers', () => {
        const activity: Activity = getActivity(1, 3, 3, 5);
        expect(Utils.activity.viewersDescription(activity)).toEqual(`Viewer 0, Viewer 1, Viewer 2 and 5 others are ${Utils.DESCRIPTIONS.VIEWERS_SUFFIX}`);
      });
    });

    describe('activityName', () => {
      it('should handle null user', () => {
        expect(Utils.activity.activityName(null)).toBeUndefined();
      });
      it('should handle undefined user', () => {
        expect(Utils.activity.activityName(undefined)).toBeUndefined();
      });
      it('should handle undefined forename', () => {
        const surname = 'Smith';
        expect(Utils.activity.activityName({ surname, forename: undefined })).toEqual(surname);
      });
      it('should handle undefined surname', () => {
        const forename = 'Bob';
        expect(Utils.activity.activityName({ surname: undefined, forename })).toEqual(forename);
      });
      it('should handle undefined forename and surname', () => {
        expect(Utils.activity.activityName({ surname: undefined, forename: undefined })).toEqual('');
      });
      it('should handle valid info', () => {
        const forename = 'Bob';
        const surname = 'Smith';
        expect(Utils.activity.activityName({ surname, forename })).toEqual(`${forename} ${surname}`);
      });
    });

    describe('activityNames', () => {
      it('should handle null users', () => {
        expect(Utils.activity.activityNames(null)).toEqual('');
      });
      it('should handle undefined users', () => {
        expect(Utils.activity.activityNames(undefined)).toEqual('');
      });
      it('should handle empty users', () => {
        expect(Utils.activity.activityNames([])).toEqual('');
      });
      it('should handle single user', () => {
        const users = getActivityInfos(1, 'User');
        expect(Utils.activity.activityNames(users)).toEqual('User 0');
      });
      it('should handle two users', () => {
        const users = getActivityInfos(2, 'User');
        expect(Utils.activity.activityNames(users)).toEqual('User 0, User 1');
      });
      it('should handle more than two users', () => {
        const users = getActivityInfos(4, 'User');
        expect(Utils.activity.activityNames(users)).toEqual('User 0, User 1, User 2, User 3');
      });
      it('should handle an undefined user', () => {
        const users = [ undefined ];
        expect(Utils.activity.activityNames(users)).toEqual('');
      });
      it('should handle an undefined user in the midst of other users', () => {
        const users = getActivityInfos(2, 'User');
        users.push(undefined);
        users.push(...getActivityInfos(3, 'Person'));
        expect(Utils.activity.activityNames(users)).toEqual('User 0, User 1, Person 0, Person 1, Person 2');
      });
    });

  });

});
