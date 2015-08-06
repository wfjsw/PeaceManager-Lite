#!/usr/bin/env node

// Handler 

var controller = require('./controller.js');
var executor = require('./executor.js');
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database(config.db_file);
var connected = false;



function processManagedCommand(ret) {
    switch (ret.require_permission) {

    }
}

controller.on('cmd_request', function (ret) {
    switch (ret.area) {
        case "any":
            switch (ret.require_permission) {
                case "admin":
                    // Check Admin
                    // We assume that Admin ID is in Config File
                    if (ret.from.id == config.admin_id) {
                        /* Command here:
                        * /reconnect
                        * /register
                        */
                        switch (ret.type) {
                            case "reconnect": // Low Priority
                                executorReconnect(ret);
                                break;
                        }
                    }
                case "anyone":
                    /* Command here:
                     * /help ---> divide into different situation
                     * /ping ---> pass the ping to Executor
                     */
                    switch (ret.type) {
                        case "help":
                            outputHelp(ret);
                            break;
                        case "ping":
                            requestPing(ret);
                            break;
                    }
                default:
                    // Print Error and then
                    return;
                    break;
            }
            break;
        case "managed":
            // Some Check Here
            db.get("SELECT * FROM managed_group WHERE id = $gid", {
                $uid: ret.group
            }, function (err, row) {
                if (err) {
                    console.error(err);
                } else if (row) {
                    // Check Passed.
                    processManagedCommand(ret);
                }
            });
            break;
    }
});
controller.on('delete_chat_photo', function (ret) {
    // Output id
});
controller.on('new_chat_title', function (ret) {
    // Check Lock - done
    db.get("SELECT * FROM managed_group WHERE id = $gid", {
        $uid: ret.group
    }, function (err, row) {
        if (err) {
            console.error(err);
            // Send Error Msg
        } else if (row.is_title_locked == 1) {
            executor.group_setname(ret.group, row.title);
        }
    });
    // Output something
});
controller.on('new_chat_photo', function (ret) {
    // Output id
});
controller.on('new_chat_participant', function (ret) {
    // Check Ban DB
    // First, check Hard-coded global ban db (Only Two User) :p ---> wfjsw/PeaceManager#1 - done
    if (ret.user.id == 68256164 || ret.user.id == 53835259) {
        executor.kickuser(ret.group, ret.user.id);
        return;
    }
    // Then, Check Ban All DataBase (Can't work around with the callback paramid :( ) - done
    db.get("SELECT id FROM banall_list WHERE userid = $uid", {
        $uid: ret.user.id
    }, function (err, row) {
        if (err) {
            console.error(err);
            // Send Error Msg
        } else if (row) {
            executor.kickuser(ret.group, ret.user.id);
        }    
    });
    // Check Ban Individal Database - done
    db.get("SELECT id FROM banned_list WHERE userid = $uid AND gid = $gid", {
        $uid: ret.user.id,
        $gid: ret.group
    }, function (err, row) {
        if (err) {
            console.error(err);
            // Send Error Msg
        } else if (row) {
            executor.kickuser(ret.group, ret.user.id);
        }
    });
});

// First Init
executor.init(config) // Missing config
.then(function (status) {
    controller.init(config); // Missing config, either
    connected = true;
});
