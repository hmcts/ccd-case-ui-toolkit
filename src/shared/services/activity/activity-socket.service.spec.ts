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
let IOSocket = require("./activity-socket.service").WrappedSocket;
let enableDestroy = require('server-destroy');
let server, io;

fdescribe('ActivitySocketService', () => {
  beforeEach(() => {
    server = http.createServer();

    io = require('socket.io')(server);
    io.on('connection', function(socket) {
      socket.emit('event',"someData");
      socket.on("otherEvent",function() {
        socket.emit('otherEvent',"Msg Received");
      });
      socket.emit('secondEvent',"someData");
      socket.emit('thirdEvent',"someDatasss");
    });
    server.listen(3000);
    enableDestroy(server);
  });

  afterEach(function() {
    server.destroy();
  });
});

var ioClient = require('socket.io-client');
var socketURL = 'http://localhost:3000';

fdescribe("fromEvent",function() {
  it('should be equal', (done) => {
    let socket = new IOSocket({url: socketURL});
    socket.fromEvent("event").subscribe((data)=> {
      expect(data).toEqual("someData"); 
      done();
    });
  });
})

describe("on",function(){
  it('should be equal', (done) => {
    let socket = new IOSocket({url: socketURL});
    socket.on("event",(data) => {
      expect(data).toEqual("someData");
      done();
    });
  });
})

describe("emit",function(){
  it('should be equal', (done) => {
    let socket = new IOSocket({url: socketURL});
    let count = 0;
    socket.emit('otherEvent');
    socket.on("otherEvent",function(data){
      expect(data).toEqual("Msg Received");
      done();
    });
  });
})


/*
import SocketMock from 'socket.io-mock';
//import { expect } from 'chai';
const expect = require('chai').expect;
describe('Fast and isolated socket tests', function(){
    fit('Sockets should be able to talk to each other without a server', function(done) {
        let socket = new SocketMock();

        socket.on('message', function (message) {
            expect(message).to.equal('Hello World!');
        });
        socket.socketClient.emit('message', 'Hello World!');
    });
});
*/


/*
var os = require('os');
var should = require("chai").should();
var socketio_client = require('socket.io-client');

var end_point = 'http://localhost:3000';
var opts = {forceNew: true};

describe("async test with socket.io", function () {
this.timeout(10000);

fit('Response should be an object', function (done) {
    setTimeout(function () {
        var socket_client = socketio_client(end_point, opts);  

        socket_client.emit('event', 'ABCDEF');

        socket_client.on('event response', function (data) {
            data.should.be.an('object');
            socket_client.disconnect();
            done();
        });

        socket_client.on('event response error', function (data) {
            console.error(data);
            socket_client.disconnect();
            done();
            });
        }, 4000);
    });
});
*/