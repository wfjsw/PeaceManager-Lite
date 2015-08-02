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
                title: msg.new_chat_photo
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
                case "/modkick":
                    if (msg.reply_to_message) {
                        ret.target = msg.reply_to_message.from;
                        ret.type = "kick";
                        ret.area = "managed";
                        ret.require_permission = "moderator";
                        EventEmitter.emit('cmd_request', ret);
                    }
                    break;
                case "/modban":
                    if (msg.reply_to_message) {
                        ret.target = msg.reply_to_message.from;
                        ret.type = "ban";
                        ret.area = "managed";
                        ret.require_permission = "moderator";
                        EventEmitter.emit('cmd_request', ret);
                    }
                    break;
                case "/rules": // INFO
                    ret.target = msg.chat;
                    ret.type = "help";
                    ret.area = "any";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                    break;
                case "/description": // INFO
                    ret.target = msg.chat;
                    ret.type = "help";
                    ret.area = "any";
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
                /*case "/invite":  // Let's invite directly in client
                    if (!isNaN(strget[1])) {
                        ret.target = strget[1];
                        ret.type = "invitehere";
                        ret.area = "managed";
                        ret.require_permission = "anyone";
                        EventEmitter.emit('cmd_request', ret);
                    } else {
                        // Only ID is allowed
                    }
                    break;*/
                case "/modlist":
                    ret.target = Math.abs(msg.chat.id);
                    ret.type = "modlist";
                    ret.area = "managed";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                    break;
                case "/group-info":
                    /*ret.target = msg.chat;
                    ret.type = "group-info";
                    ret.area = "any"; // !IMPORTANT
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);*/
                    outputGroupInfo(msg.chat, msg.chat); // Implement This
                    break;
                // Admin Group Part
                case "/make-this-admin-group": // The User Executor runs in should always be admin.
                    ret.target = Math.abs(msg.chat.id);
                    ret.type = "define_to_admin_group";
                    ret.area = "any";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                    break;
                case "/claim": // ID
                    if (!isNaN(strget[1])) {
                        ret.target = parseInt(strget[1]);
                        ret.type = "claim_to_admin_group";
                        ret.area = "admingroup";
                        ret.require_permission = "admin";
                        EventEmitter.emit('cmd_request', ret);
                    } else {
                        // Sad things :(
                    }
                    break;
                case "/unclaim": // ID
                    if (!isNaN(strget[1])) {
                        ret.target = parseInt(strget[1]);
                        ret.type = "unclaim_to_admin_group";
                        ret.area = "admingroup";
                        ret.require_permission = "admin";
                        EventEmitter.emit('cmd_request', ret);
                    } else {
                        // Sad things :(
                    }
                    break;
                // TODO: Support Username Search for the following commands.
                case "/ban": // ID, TargetIsObject
                    if (!isNaN(strget[1]) && !isNaN(strget[2])) { 
                        ret.target = {
                            user: parseInt(strget[1]),
                            group: parseInt(strget[2])
                        };
                        ret.type = "ban";
                        ret.area = "admingroup";
                        ret.require_permission = "admin";
                        EventEmitter.emit('cmd_request', ret);
                    } else {
                        // Sad things :(
                    }
                    break;
                case "/banall": // ID
                    if (!isNaN(strget[1])) {
                        ret.target = parseInt(strget[1]);
                        ret.type = "banall";
                        ret.area = "admingroup";
                        ret.require_permission = "admin";
                        EventEmitter.emit('cmd_request', ret);
                    } else {
                        // Sad things :(
                    }
                    break;
                case "/unban": // ID, TargetIsObject
                    if (!isNaN(strget[1]) && !isNaN(strget[2])) {
                        ret.target = {
                            user: parseInt(strget[1]),
                            group: parseInt(strget[2])
                        };
                        ret.type = "unban";
                        ret.area = "admingroup";
                        ret.require_permission = "admin";
                        EventEmitter.emit('cmd_request', ret);
                    } else {
                        // Sad things :(
                    }
                    break;
                case "/unbanall": // ID
                    if (!isNaN(strget[1])) {
                        ret.target = parseInt(strget[1]);
                        ret.type = "unbanall";
                        ret.area = "admingroup";
                        ret.require_permission = "admin";
                        EventEmitter.emit('cmd_request', ret);
                    } else {
                        // Only ID is allowed
                    }
                    break;
                case "/listban":
                    ret.target = msg.from;
                    ret.type = "listban";
                    ret.area = "admingroup";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                    break;
                case "/listadmin":
                    ret.target = msg.from;
                    ret.type = "listadmin";
                    ret.area = "admingroup";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                    break;
                case "/listmanaged":
                    ret.target = msg.from;
                    ret.type = "listmanagedgroup";
                    ret.area = "admingroup";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                    break;
                case "/kick": // ID
                    if (!isNaN(strget[1]) && !isNaN(strget[2])) {
                        ret.target = parseInt(strget[1]);
                        ret.type = "ban";
                        ret.area = "admingroup";
                        ret.require_permission = "admin";
                        EventEmitter.emit('cmd_request', ret);
                    } else {
                        // Sad Things :(
                    }
                    break;
                case "/add-admin": // The bot Holder has the ability to add admins without proposals
                case "/remove-admin": // Also
                case "/join":
                    ret.target = msg.from;
                    ret.type = "join";
                    ret.area = "admingroup";
                    ret.require_permission = "anyone";
                    EventEmitter.emit('cmd_request', ret);
                case "/settings":

                // .... Not Implemented
                // case "/resolve-username": // Database Lookup

                // .... special cases
                case "/set":
            }
        }

    }
})


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
    },
    newProposal: function (content, isspecial) {
        // New Proposal Message, forceReply and Keyboard On
        // messageID -> voteID
        // Write out Result and then call the callback.
    }
};