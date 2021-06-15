import * as io from 'socket.io-client';
import { ManagerOptions, SocketOptions } from 'socket.io-client';

const BASE_CONFIGURATION = {
  reconnection: true,
  reconnectionDelayMax: 1000 * 10, // 10 seconds
  timeout: 1000 * 60 * 3, // 5 minutes
};

const UTILS = {
  getTransports: (allowWebSockets: boolean): object => {
    const transports = allowWebSockets ? ['polling', 'websocket'] : ['polling'];
    return {
      transports,
      upgrade: allowWebSockets
    };
  },
  getOptions: (user: object, allowWebSockets: boolean): Partial<ManagerOptions & SocketOptions> => {
    return {
      ...BASE_CONFIGURATION,
      ...UTILS.getTransports(allowWebSockets),
      query: { user }
    };
  },
  getSocket: (user: object, allowWebSockets = false): io.Socket => {
    // Connects to current URL by not providing a uri parameter.
    return io(UTILS.getOptions(user, allowWebSockets));
  }
};

export const Utils = {
  ...UTILS,
  BASE_CONFIGURATION
};
