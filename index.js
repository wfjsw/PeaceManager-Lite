#!/usr/bin/env node

// Handler 

var controller = require('./controller.js');
var executor = require('./executor.js');
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database(config.db_file);
var connected = false;



function processManagedCommand(ret) {
    switch (ret.require_permission) {
        case "admin":
            // Check Admin
            // We assume that Admin ID is in Config File
            if (ret.from.id == config.admin_id) {
                /*
                 * promote
                 * demote
                 * lock title
                 * lock photo
                 * banall
                 */
                switch (ret.type) {
                    case "promote":
                        // Check then update record
                        Promote(ret);
                        break;
                    case "demote":
                        // Check then update record
                        Demote(ret);
                        break;
                    case "set-lock-title-on":
                        titleLocker(true, ret);
                        break;
                    case "set-lock-title-off":
                        titleLocker(false, ret);
                        break;
                    case "banall":
                        Ban(ret);
                        break;
                    case "unbanall":
                }
            }
            break;
        case "moderator":
            db.get("SELECT * FROM moderator_list WHERE modid = $uid AND gid = $gid", {
                $uid: ret.user.id,
                $gid: ret.chatfrom
            }, function (err, row) {
                if (err) {
                    console.error(err);
                } else if (row) {
                    // Check Passed.
                    switch (ret.type) {
                        case "kick":
                            // Check then update record
                            Kick(ret);
                            break;
                        case "ban":
                            // Check then update record
                            Ban(ret);
                            break;
                        case "unban":
                    }
                }
            });
            break;
        case "anyone":
        default:
            // ERROR
    }
}

function outputHelp(ret) {
    // Any Help msg?
}

function requestPing(ret) {
    executor.msg(ret.chatfrom, "Pong!");
}

function Promote(ret) {
    // Check
    db.get("SELECT * FROM moderator_list WHERE modid = $uid AND gid = $gid", {
        $uid: ret.target.id,
        $gid: ret.chatfrom
    }, function (err, row) {
        if (err) {
            console.error(err);
        } else if (row === undefined) {
            // Check Passed.
            db.run("INSERT INTO moderator_list (modid, gid) VALUES ($uid, $gid)", {
                $uid: ret.target.id,
                $gid: ret.chatfrom
            });
        } // TODO: reply back
    });
}

function Demote(ret) {
    // Check
    db.get("SELECT * FROM moderator_list WHERE modid = $uid AND gid = $gid", {
        $uid: ret.target.id,
        $gid: ret.chatfrom
    }, function (err, row) {
        if (err) {
            console.error(err);
        } else if (row) {
            // Check Passed.
            db.run("DELETE FROM moderator_list WHERE modid = $uid AND gid = $gid", {
                $uid: ret.target.id,
                $gid: ret.chatfrom
            });
        } // TODO: reply back
    });
}

function titleLocker(stat, ret){

}

function Ban(ret) {
    // Check
    if (ret.type == "ban") {
        db.get("SELECT * FROM banned_list WHERE userid = $uid AND gid = $gid", {
            $uid: ret.target,
            $gid: ret.chatfrom
        }, function (err, row) {
            if (err) {
                console.error(err);
            } else if (row === undefined) {
                // Check Passed.
                db.run("INSERT INTO banned_list (userid, banbyid, gid) VALUES ($uid, $eid, $gid)", {
                    $uid: ret.target,
                    $eid: ret.user.id,
                    $gid: ret.chatfrom
                });
                Kick(ret);
            } 
        });
    } else if (ret.type == "banall") {
        db.get("SELECT * FROM banall_list WHERE userid = $uid", {
            $uid: ret.target
        }, function (err, row) {
            if (err) {
                console.error(err);
            } else if (row === undefined) {
                // Check Passed.
                db.run("INSERT INTO banall_list (userid) VALUES ($uid)", {
                    $uid: ret.target
                });
                Kick(ret);
            }
        });
    }
}

function Kick(ret) {
    executor.kickuser(ret.chatfrom, ret.target);
}

controller.on('cmd_request', function (ret) {
    switch (ret.area) {
        case "any":
            switch (ret.require_permission) {
                case "admin":
                    // Check Admin
                    // We assume that Admin ID is in Config File
                    if (ret.user.id == config.admin_id) {
                        /* Command here:
                        * /reconnect
                        * /register
                        */
                        switch (ret.type) {
                            case "reconnect":// Low Priority
                                // executorReconnect(ret);
                                break;
                        }
                    }
                    break;
                case "anyone":
                    /* Command here:
                     * /help ---> divide into different situation
                     * /ping ---> pass the ping to Executor - done
                     */
                    switch (ret.type) {
                        case "help":
                            outputHelp(ret);
                            break;
                        case "ping":
                            requestPing(ret);
                            break;
                    }
                    break;
                default:
                    // Print Error and then
                    return;
                    break;
            }
            break;
        case "managed":
            // Some Check Here
            db.get("SELECT * FROM managed_group WHERE id = $gid", {
                $gid: ret.chatfrom
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
    controller.msg({
        text: "#GroupPhotoDeleted by @" + ret.from.username + " ( " + ret.from.id + " ) ",
        chat_id: -(ret.group)
    });
});
controller.on('new_chat_title', function (ret) {
    // Check Lock - done
    db.get("SELECT * FROM managed_group WHERE id = $gid", {
        $gid: ret.group
    }, function (err, row) {
        if (err) {
            console.error(err);
            // Send Error Msg
        } else if (row.is_title_locked == 1) {
            executor.group_setname(ret.group, row.title);
        } else {
            // Output something
            controller.msg({
                text: "#GroupTitleChanged by @" + ret.from.username + " ( " + ret.from.id + " ) ",
                chat_id: -(ret.group)
            });
            // Update Database

        }
    });
});
controller.on('new_chat_photo', function (ret) {
    // Output id
    controller.msg({
        text: "#GroupPhotoChanged by @" + ret.from.username + " ( " + ret.from.id + " ) ",
        chat_id: -(ret.group)
    });
});

controller.on('new_chat_participant', function (ret) {
    // Check Ban DB
    // First, check Hard-coded global ban db (Only Two User) :p ---> wfjsw/PeaceManager#1 - done
    if (ret.user.id == 68256164 || ret.user.id == 53835259) {
        Kick(ret);
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
            Kick(ret);
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
            Kick(ret);
        }
    });

    // Output User Details - done
    controller.msg({
        text: "#UserJoin @" + ret.from.username + " ( " + ret.from.id + " ) ",
        chat_id: -(ret.group)
    });
    // Extra Bonus: Update Title And Database - done
    db.get("SELECT * FROM managed_group WHERE id = $gid", {
        $gid: ret.group
    }, function (err, row) {
        if (err) {
            console.error(err);
        } else if (row === undefined) {
            // Not Exist
            db.run("INSERT INTO managed_group (id, title, is_title_locked) VALUES ($uid, $title, 0)", {
                $uid: ret.target,
                $title: ret.title
            });
        } else if (row) {
            db.run("UPDATE managed_group SET title = $title WHERE iid = $gid", {
                $gid: ret.group,
                $title: ret.title
            });
        }
    });
});

// First Init
executor.init(config) // Missing config
.then(function (status) {
    controller.init(config); // Missing config, either
    connected = true;
});
