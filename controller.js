// Controller

var Telegram = require('telegram-bot');
var tg;
var EventEmitter = require('events').EventEmitter;

tg.on('message', function (msg) {
    if (msg.chat.id < 0) {
        
        // ****************************
        // Events for Group Changes
        if (msg.new_chat_participant) {
            var ret = {
                group: Math.abs(msg.chat.id),
                title: msg.chat.title,
                timestamp: msg.date,
                user: msg.new_chat_participant
            };
            EventEmitter.emit('new_chat_participant', ret);
        } else if (msg.new_chat_title) {
            var ret = {
                group: Math.abs(msg.chat.id),
                timestamp: msg.date,
                from: msg.from,
                title: msg.new_chat_title
            };
            EventEmitter.emit('new_chat_title', ret);
        } else if (msg.new_chat_photo) {
            var ret = {
                group: Math.abs(msg.chat.id),
                timestamp: msg.date,
                from: msg.from,
                photo: msg.new_chat_photo
            };
            EventEmitter.emit('new_chat_photo', ret);
        } else if (msg.delete_chat_photo) {
            var ret = {
                group: Math.abs(msg.chat.id),
                timestamp: msg.date,
                from: msg.from
            };
            EventEmitter.emit('delete_chat_photo', ret);
        }
        // OK end.
        // ****************************
        
        // ****************************
        // Begin InGroup Command Process
        if (msg.text && (msg.text.slice(0, 1) == '/')) {
            var strget = msg.text.split(' ');
            var ret = {
                chatfrom: Math.abs(msg.chat.id),
                user: msg.from,
                timestamp: msg.date
            };
            switch (strget[0]) {
                case "/kickme":
                    ret.target = msg.from;
                    ret.type = "kick";
                    ret.area = "managed";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                    break;
                case "/help": // INFO
                    ret.target = msg.chat;
                    ret.type = "help";
                    ret.area = "any";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                    break;
                // Normal Managed Group Part
                case "/kick":
                    if (msg.reply_to_message) {
                        ret.target = msg.reply_to_message.from.id;
                        ret.type = "kick";
                        ret.area = "managed";
                        ret.require_permission = "moderator";
                        EventEmitter.emit('cmd_request', ret);
                    } else if (isNaN(strget[1])) {
                        ret.target = parseInt(strget[1]);
                        ret.type = "kick";
                        ret.area = "managed";
                        ret.require_permission = "moderator";
                        EventEmitter.emit('cmd_request', ret);
                    }
                    break;
                case "/ban":
                    if (msg.reply_to_message) {
                        ret.target = msg.reply_to_message.from.id;
                        ret.type = "ban";
                        ret.area = "managed";
                        ret.require_permission = "moderator";
                        EventEmitter.emit('cmd_request', ret);
                    } else if (isNaN(strget[1])) {
                        ret.target = parseInt(strget[1]);
                        ret.type = "ban";
                        ret.area = "managed";
                        ret.require_permission = "moderator";
                        EventEmitter.emit('cmd_request', ret);
                    }
                    break;
                case "/banall":
                    if (msg.reply_to_message) {
                        ret.target = msg.reply_to_message.from.id;
                        ret.type = "banall";
                        ret.area = "managed";
                        ret.require_permission = "admin";
                        EventEmitter.emit('cmd_request', ret);
                    } else if (isNaN(strget[1])) {
                        ret.target = parseInt(strget[1]);
                        ret.type = "banall";
                        ret.area = "managed";
                        ret.require_permission = "admin";
                        EventEmitter.emit('cmd_request', ret);
                    }
                    break;
                case "/rules": // INFO
                    ret.target = msg.chat;
                    ret.type = "help";
                    ret.area = "managed";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                    break;
                case "/description": // INFO
                    ret.target = msg.chat;
                    ret.type = "help";
                    ret.area = "managed";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                    break;
                case "/promote":
                    if (msg.reply_to_message) {
                        ret.target = msg.reply_to_message.from;
                        ret.type = "promote";
                        ret.area = "managed";
                        ret.require_permission = "admin";
                        EventEmitter.emit('cmd_request', ret);
                    }
                    break;
                case "/demote":
                    if (msg.reply_to_message) {
                        ret.target = msg.reply_to_message.from;
                        ret.type = "demote";
                        ret.area = "managed";
                        ret.require_permission = "admin";
                        EventEmitter.emit('cmd_request', ret);
                    }
                    break;
                case "/modlist":
                    ret.target = msg.chat;
                    ret.type = "modlist";
                    ret.area = "managed";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                    break;
                case "/group-info":
                    outputGroupInfo(msg.chat, msg.chat); // Implement-ing This
                    break;
                case "/listban":
                    ret.target = msg.from;
                    ret.type = "listban";
                    ret.area = "managed";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                    break;
                case "/ping":
                    ret.target = msg.from;
                    ret.type = "ping";
                    ret.area = "any";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                    break;
                /*case "/reconnect":
                    ret.target = msg.from;
                    ret.type = "reconnect";
                    ret.area = "any";
                    ret.require_permission = "admin";
                    EventEmitter.emit('cmd_request', ret);
                    break;*/
                // .... Not Implemented
                // case "/resolve-username": // Database Lookup

                // .... special cases
                case "/set": // May cause deadlock
                    if (strget[1]) 
                        switch (strget[1]) {
                            // Pass this function to @Jqs7Bot
                            /*
                            case "rules":  // don't got an idea here
                                if (isNaN(strget[2])) {
                                    ret.target = msg.chat;
                                    ret.type = "set-rules";
                                    ret.area = "any";
                                    ret.require_permission = "admin";
                                    EventEmitter.emit('cmd_request', ret);
                                }
                                break;
                            case "description": // don't got an idea here either
                                if (isNaN(strget[2])) {
                                    ret.target = msg.chat;
                                    ret.type = "set-description";
                                    ret.area = "any";
                                    ret.require_permission = "admin";
                                    EventEmitter.emit('cmd_request', ret);
                                }
                                break;
                             */
                            case "lock":
                                // blah blah blah...
                                if (strget[2])
                                    switch (strget[2]) {
                                        case "titles":
                                            if (strget[3] == "on") {
                                                ret.target = msg.chat;
                                                ret.type = "set-lock-title-on";
                                                ret.area = "managed";
                                                ret.require_permission = "admin";
                                                EventEmitter.emit('cmd_request', ret);
                                            } else if (strget[3] == "off") {
                                                ret.target = msg.chat;
                                                ret.type = "set-lock-title-off";
                                                ret.area = "managed";
                                                ret.require_permission = "admin";
                                                EventEmitter.emit('cmd_request', ret);
                                            }
                                            break;
                                        //case "photos": Not Implemented
                                    }
                                break;
                        }
                    break;
            }
        }

    }
})

// send target's info to requestfrom
function outputGroupInfo(requestfrom, target) {
    if (requestfrom && target.id < 0) {
        outinterface.msg({
            text: "Group ID " + Math.abs(target.id),
            chat_id: requestfrom.id
        });
    }
}


var outinterface = {
    init: function (config) {
        return new Promise(function (resolve, reject) {
            tg = new Telegram(config.token);
            tg.start();
            tg.getMe()
			.then(function (res) {
                resolve(res);
            }).catch(function (err) {
                reject(err);
            });
        });
    },
    msg: function (msgobj) {
        return tg.sendMessage(msgobj);
    }
};

module.exports = outinterface;