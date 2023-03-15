import { connect, ManagerOptions, Socket, SocketOptions } from 'socket.io-client';

import { Activity, ActivityInfo, CaseActivityInfo, User } from '../../../domain';

const BASE_CONFIGURATION = {
  autoConnect: false, // (default is false)
  reconnection: true,
  reconnectionDelay: 1000 * 2, // 2 seconds (default is 1s)
  reconnectionDelayMax: 1000 * 30, // 30 seconds (default is 5s)
  timeout: 1000 * 60 * 3 // 5 minutes (default is 20s)
};

const TRANSPORTS = {
  allowWebSockets: ['websocket'], // No fallback to long polling allowed.
  disallowWebSockets: ['polling']
};

export enum MODES {
  off = 'off',
  polling = 'polling',
  socket = 'socket',
  socketLongPoll = 'socket-long-poll'
}

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
  getSocket: (user: object, allowWebSockets = false): Socket => {
    // Connects to current URL by not providing a uri parameter.
    return connect(UTILS.getOptions(user, allowWebSockets));
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
        const lastCommaIndex = resultText.lastIndexOf(',');
        if (lastCommaIndex >= 0) {
          resultText = `${resultText.slice(0, lastCommaIndex)} and${resultText.slice(lastCommaIndex + 1)}`;
        }
      }
      let preSuffix = '';
      if (suffix.length > 0) {
        if (names.length + unknownCount > 1) {
          preSuffix = ' are ';
        } else {
          preSuffix = ' is ';
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
    activityNames: (users: (ActivityInfo | User)[]): string => {
      if (users?.length > 0) {
        return users.map(user => UTILS.activity.activityName(user)).filter(name => !!name).join(', ');
      }
      return '';
    },
    stripUserFromActivity: (activity: Activity | CaseActivityInfo, user: object): Activity | CaseActivityInfo => {
      const userId = user ? user['id'] : undefined;
      if (userId && UTILS.activity.hasViewersOrEditors(activity)) {
        activity.editors = activity.editors.filter(e => e.id !== userId);
        activity.viewers = activity.viewers.filter(v => v.id !== userId);
      }
      return activity;
    }
  }
};

export const Utils = {
  BASE_CONFIGURATION,
  DESCRIPTIONS,
  TRANSPORTS,
  ...UTILS,
};
