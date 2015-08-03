// Executor

var EventEmitter = require('events').EventEmitter;
var Promise = require('promise');
var net = require('net');
var clientupd, clientcmd, queuetimer;
var w_sending = new Array(); // 用于发送前队列
var connected = false;

function initqueue() {
    // Start The Interval
    queuetimer = setInterval(sendqueue, 300);
}

function sendqueue() {
    if (w_sending.length>0 && connected){
        var thismsg = w_sending.shift();
        clientupd.write(thismsg.command + "\n", 'utf8', function () {
            thismsg.callback.resolve("sent");
        });
    }
}

// NOT NOW: Listen from socket, process the output and continue the queue.

function newmsg(command, resolve, reject) {
    if (connected = true) {
        var msg = {
            command: command,
            callback: {
                resolve: resolve,
                reject: reject
            }
        };
        w_sending.push(msg);
    } else {
        reject("error: unconnected");
        console.log("Unconnected!");
    }
}

var outinterface = {
    init: function (config) {
        return new Promise(function (resolve, reject) {
            clientupd = net.connect({port: config.port, host: config.host || "127.0.0.1"}, function() {
                connected = true;
                socket.setKeepAlive(true);
                initqueue();
                resolve("connected");
            });
        })
    },
    disconnect: function () {
        clientupd.end();
        connected = false;
        clearInterval(queuetimer);
    },
    startqueue: function () {
        clearInterval(queuetimer);
        initqueue();
    },
    stopqueue: function () {
        clearInterval(queuetimer);
    },
    joingroup: function (chat, memberid, forwardmsg) {
        return new Promise(function (resolve, reject){
            newmsg("chat_add_user " + chat + " " + memberid + " " + forwardmsg, resolve, reject);
        });
    },
    kickuser: function (chat, memberid) {
        return new Promise(function (resolve, reject){
            newmsg("chat_del_user " + chat + " " + memberid, resolve, reject);
        });
    },
    msg: function (peer, text){
        return new Promise(function (resolve, reject){
            newmsg("msg " + peer + " " + text, resolve, reject);
        });
    },
    group_setphoto: function (chat, filename) {
        return new Promise(function (resolve, reject){
            newmsg("chat_set_photo " + chat + " " + filename, resolve, reject);
        });
    },
    group_setname: function (chat, name) {
        return new Promise(function (resolve, reject){
            newmsg("rename_chat " + chat + " " + name, resolve, reject);
        });
    }
    // Replace This With Controller Function
    /*resolvname: function (username) {
        return new Promise(function (resolve, reject){
            newmsg("resolve_username " + username, resolve, reject);
        });
    },*/
};
module.exports = outinterface;
