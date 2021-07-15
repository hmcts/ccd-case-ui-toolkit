import * as io from 'socket.io-client';
import { ManagerOptions, SocketOptions } from 'socket.io-client';
import { Activity, ActivityInfo, CaseActivityInfo, User } from '../../../domain';

const BASE_CONFIGURATION = {
  reconnection: true,
  reconnectionDelayMax: 1000 * 10, // 10 seconds
  timeout: 1000 * 60 * 3, // 5 minutes
};

const TRANSPORTS = {
  allowWebSockets: ['websocket', 'polling'], // No fallback to long polling allowed.
  disallowWebSockets: ['polling']
};

const MODES = {
  off: 'off',
  polling: 'polling',
  socket: 'socket',
  socketLongPoll: 'socket-long-poll'
};

const DESCRIPTIONS = {
  VIEWERS_SUFFIX: 'viewing this case',
  EDITORS_PREFIX: 'This case is being updated by '
};

const UTILS = {
  getTransports: (allowWebSockets: boolean): object => {
    const transports = allowWebSockets ? TRANSPORTS.allowWebSockets : TRANSPORTS.disallowWebSockets;
    return {
      transports,
      upgrade: allowWebSockets
    };
  },
  getOptions: (user: object, allowWebSockets: boolean): Partial<ManagerOptions & SocketOptions> => {
    return {
      ...BASE_CONFIGURATION,
      ...UTILS.getTransports(allowWebSockets),
      query: { user: JSON.stringify(user) }
    };
  },
  getSocket: (user: object, allowWebSockets = false): io.Socket => {
    // Connects to current URL by not providing a uri parameter.
    return io(UTILS.getOptions(user, allowWebSockets));
  },
  activity: {
    hasEditors: (activity: Activity | CaseActivityInfo): boolean => {
      if (activity) {
        return (activity.editors.length + activity.unknownEditors) > 0;
      }
      return false;
    },
    hasViewers: (activity: Activity | CaseActivityInfo): boolean => {
      if (activity) {
        return (activity.viewers.length + activity.unknownViewers) > 0;
      }
      return false;
    },
    hasViewersOrEditors: (activity: Activity | CaseActivityInfo): boolean => {
      return UTILS.activity.hasViewers(activity) || UTILS.activity.hasEditors(activity);
    },
    editorsDescription: (activity: Activity | CaseActivityInfo): string => {
      if (UTILS.activity.hasEditors(activity)) {
        return UTILS.activity.generateDescription(DESCRIPTIONS.EDITORS_PREFIX, '', activity.editors, activity.unknownEditors);
      }
      return undefined;
    },
    viewersDescription: (activity: Activity | CaseActivityInfo): string => {
      if (UTILS.activity.hasViewers(activity)) {
        return UTILS.activity.generateDescription('', DESCRIPTIONS.VIEWERS_SUFFIX, activity.viewers, activity.unknownViewers);
      }
      return undefined;
    },
    generateDescription: (prefix: string, suffix: string, names: Array<ActivityInfo | User>, unknownCount: number): string => {
      let resultText = `${prefix}${UTILS.activity.activityNames(names)}`;
      if (unknownCount > 0) {
        resultText += (names.length > 0 ? ` and ${unknownCount} other` : `${unknownCount} user`);
        if (unknownCount > 1) {
          resultText = `${resultText}s`;
        }
      } else {
        resultText = resultText.replace(/(.*)\,(.*?)$/, '$1 and$2');
      }
      let preSuffix = '';
      if (suffix.length > 0) {
        if (names.length + unknownCount > 1) {
          preSuffix = ' are ';
        } else {
          preSuffix = ' is '
        }
      }
      return `${resultText}${preSuffix}${suffix}`;
    },
    activityName: (user: ActivityInfo | User): string => {
      if (user) {
        return `${user.forename || ''} ${user.surname || ''}`.trim();
      }
      return undefined;
    },
    activityNames: (users: Array<ActivityInfo | User>): string => {
      if (users && users.length > 0) {
        return users.map(info => UTILS.activity.activityName(info)).filter(name => !!name).join(', ');
      }
      return '';
    },
    stripUserFromActivity: (activity: Activity | CaseActivityInfo, user: object): Activity | CaseActivityInfo => {
      if (user && user['id'] && UTILS.activity.hasViewersOrEditors(activity)) {
        activity.editors = activity.editors.filter(e => e.id !== user['id']);
        activity.viewers = activity.viewers.filter(v => v.id !== user['id']);
      }
      return activity;
    }
  }
};

export const Utils = {
  BASE_CONFIGURATION,
  DESCRIPTIONS,
  MODES,
  TRANSPORTS,
  ...UTILS,
};
