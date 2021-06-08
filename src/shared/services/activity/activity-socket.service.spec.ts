import { TestBed } from '@angular/core/testing';
import { ActivitySocketService } from './activity-socket.service';
import { SocketIoModule } from 'ngx-socket-io';
import { socketConfig } from '../../../app.config';

describe('ActivitySocketService', () => {
  let service: ActivitySocketService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ SocketIoModule.forRoot(socketConfig) ],
      providers: [ ActivitySocketService ]
    });
    service = TestBed.get(ActivitySocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

let http = require('http');
// let IOSocket = require('./activity-socket.service').WrappedSocket;
let enableDestroy = require('server-destroy');
let server, io;

beforeEach(() => {
  server = http.createServer();

  io = require('socket.io')(server);
  io.on('connection', function(socket) {
    socket.emit('event', 'someData');
    socket.on('otherEvent', function() {
      socket.emit('otherEvent', 'Msg Received');
    });
    socket.emit('secondEvent', 'someData');
    socket.emit('thirdEvent', 'someDatasss');
  });
  server.listen(3000);
  enableDestroy(server);
});

afterEach(function() {
  server.destroy();
});

// const ioClient = require('socket.io-client');
// const socketURL = 'http://localhost:3000';
const sock = io('http://localhost:3000');

describe('fromEvent', function() {
  it('should be equal', (done) => {
    // let socket = new IOSocket({url: socketURL});
    sock.fromEvent('event').subscribe((data) => {
      expect(data).toEqual('someData');
      done();
    });
  });
})

describe('on', function() {
  it('should be equal', (done) => {
    // let socket = new IOSocket({url: socketURL});
    sock.on('event', (data) => {
      expect(data).toEqual('someData');
      done();
    });
  });
})

describe('emit', function() {
  it('should be equal', (done) => {
    // let socket = new IOSocket({url: socketURL});
    sock.emit('otherEvent');
    sock.on('otherEvent', function(data) {
      expect(data).toEqual('Msg Received');
      done();
    });
  });
})

/*
import SocketMock from 'socket.io-mock';
//import { expect } from 'chai';
const expect = require('chai').expect;
describe('Fast and isolated socket tests', function(){
    it('Sockets should be able to talk to each other without a server', function(done) {
        let socket = new SocketMock();

        socket.on('message', function (message) {
            expect(message).to.equal('Hello World!');
        });
        socket.socketClient.emit('message', 'Hello World!');
    });
});
*/
