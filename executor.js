// Executor

var EventEmitter = require('events').EventEmitter;
var Promise = require('promise');
var net = require('net');
var clientupd;
var connected = false;


function newmsg(command, resolve, reject) {
    if (connected = true) {
        clientupd.write(command + "\n", 'utf8', function () {
            console.log("command sent.")
        });
    } else {
        reject("error: unconnected");
        console.log("Unconnected!");
    }
}

var outinterface = {
    init: function (config) {
        return new Promise(function (resolve, reject) {
            clientupd = net.connect({path: config.cli.socket}, function() {
                connected = true;
                console.log("executor connected")
                resolve("connected");
            });
        })
    },
    disconnect: function () {
        clientupd.end();
        connected = false;
    },
    joingroup: function (chat, memberid, forwardmsg) {
        return new Promise(function (resolve, reject){
            newmsg("chat_add_user chat#" + chat + " user#" + memberid + " " + forwardmsg, resolve, reject);
        });
    },
    kickuser: function (chat, memberid) {
        newmsg("chat_del_user chat#" + chat + " " + memberid);
    },
    msg: function (peer, text){
        newmsg("msg chat#" + peer + " " + text);
    },
    group_setphoto: function (chat, filename) {
        newmsg("chat_set_photo chat#" + chat + " " + filename, resolve, reject);
    },
    group_setname: function (chat, name) {
        newmsg("rename_chat chat#" + chat + " " + name);
    }
    // Replace This With Controller Function
    /*resolvname: function (username) {
        return new Promise(function (resolve, reject){
            newmsg("resolve_username " + username, resolve, reject);
        });
    },*/
};
module.exports = outinterface;
