#!/usr/bin/env node

// Handler 

var controller = require('./controller.js');
var executor = require('./executor.js');
var config = require('./config.js');
var banlist = require('./banlist.js');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(config.db_file);
var connected = false;

// Main TODO: prevent user from ban bot itself

function processManagedCommand(ret) {
    switch (ret.require_permission) {
        case "admin":
            // Check Admin
            // We assume that Admin ID is in Config File
            if (ret.user.id == config.admin_id) {
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
                        controller.msg({
                            text: "Title Locker On!",
                            chat_id: -(ret.chatfrom)
                        });
                        break;
                    case "set-lock-title-off":
                        titleLocker(false, ret);
                        controller.msg({
                            text: "Title Locker Off!",
                            chat_id: -(ret.chatfrom)
                        });
                        break;
                    case "set-lock-photo-on":
                        photoLocker(true, ret);
                        controller.msg({
                            text: "Photo Locker On! Remember to read photo_lock_readme.txt before you use!",
                            chat_id: -(ret.chatfrom)
                        });
                        break;
                    case "set-lock-photo-off":
                        photoLocker(false, ret);
                        controller.msg({
                            text: "Photo Locker Off!",
                            chat_id: -(ret.chatfrom)
                        });
                        break;
                    case "banall":
                        Ban(ret);
                        break;
                    case "unbanall":
                        unBan(ret);
                        break;
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
                } else if (row || ret.user.id == config.admin_id) {
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
                            unBan(ret);
                            break;
                    }
                }
            });
            break;
        case "anyone":
            // kickme and help
            switch (ret.type) {
                case "kick":
                    // kickme :p
                    if (ret.target == ret.user.id) Kick(ret);
                    break;
                case "help":
                    outputHelp(ret);
                    break;
                case "modlist":
                    listModerators(ret);
                    break;
                case "listban":
                case "listbanall":
                    listBannings(ret);
                    break;
            }
            break;
        default:
            // ERROR
    }
}

function outputHelp(ret) {
    // Any Help msg?
    var helpmsg = "PeaceManager-Lite 2nd Release\n";
    helpmsg += "written by @wfjsw , Bot to manage group chats\n\n";
    helpmsg += "User can use the following command:\n";
    helpmsg += " /kickme - Remove me so that I can join again later (if you \"leave\", you may not be able to re-enter) \n";
    helpmsg += "Moderators commands: \n";
    helpmsg += " /kick (ID) - Kick by reply or by numeric ID \n";
    helpmsg += " /ban (ID) - Ban by reply or by numeric ID \n";
    helpmsg += " /unban (ID) - unBan by reply or by numeric ID \n";
    helpmsg += "Owner commands:\n";
    helpmsg += " /promote - Promote a user to Moderator by reply \n";
    helpmsg += " /demote - Demote a user From Moderator by reply \n";
    helpmsg += " /banall - Ban by reply or by numeric ID across ALL YOUR MANAGED GROUPS \n";
    helpmsg += " /unbanall - unBan by reply or by numeric ID across ALL YOUR MANAGED GROUPS \n";
    helpmsg += " /set lock title on/off - Lock or Unlock the Title of this group \n\n";
    helpmsg += "PeaceManager-Lite version 2, Copyright(C) 2015 of wfjsw \n";
    helpmsg += "PeaceManager-Lite comes with ABSOLUTELY NO WARRANTY; This is free software, and you are welcome to redistribute it under certain conditions; Read GNU General Public License 2.0 for details.";
    controller.msg({
        text: helpmsg,
        chat_id: -(ret.chatfrom)
    });
}

function requestPing(ret) {
    executor.msg(ret.chatfrom, "Pong!");
}

function listModerators(ret) {
    db.all("SELECT * FROM moderator_list WHERE modid = $uid AND gid = $gid", {
        $uid: ret.target.id,
        $gid: ret.chatfrom
    }, function (err, rows) {
        if (err) {
            console.error(err);
        } else if (rows == []) {
            controller.msg({
                text: "No Moderator Found",
                chat_id: -(ret.chatfrom)
            });
        } else {
            var output = "Moderator List for " + ret.chatfrom + "\n";
            for (var i in rows) {
                output += rows[i].modid + "\n";
            }
            controller.msg({
                text: output,
                chat_id: -(ret.chatfrom)
            });
        }
    });
}

function listBannings(ret) {
    // ignore too long
    controller.msg({
        text: "Not Implemented",
        chat_id: -(ret.chatfrom)
    });
}

function Promote(ret) {
    // Check
    db.get("SELECT * FROM moderator_list WHERE modid = $uid AND gid = $gid", {
        $uid: ret.target.id,
        $gid: ret.chatfrom
    }, function (err, row) {
        if (err) {
            console.error(err);
            controller.msg({
                text: "Error occurred.",
                chat_id: -(ret.chatfrom)
            });
        } else if (row === undefined) {
            // Check Passed.
            db.run("INSERT INTO moderator_list (modid, gid) VALUES ($uid, $gid)", {
                $uid: ret.target.id,
                $gid: ret.chatfrom
            });
            controller.msg({
                text: "User @" + ret.target.username + " Promoted as an Moderator.",
                chat_id: -(ret.chatfrom)
            });
        } // TODO: reply back
        else {
            controller.msg({
                text: "User Exist.",
                chat_id: -(ret.chatfrom)
            });
        }
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
            controller.msg({
                text: "User @" + ret.target.username + " Demoted.",
                chat_id: -(ret.chatfrom)
            });
        } // TODO: reply back
    });
}

function titleLocker(stat, ret){
    var lock = stat ? 1 : 0;
    db.run("UPDATE managed_group SET is_title_locked = $lock WHERE id = $gid", {
        $gid: ret.chatfrom,
        $lock: lock
    });
}

function photoLocker(stat, ret) {
    var lock = stat ? 1 : 0;
    db.run("UPDATE managed_group SET is_photo_locked = $lock WHERE id = $gid", {
        $gid: ret.chatfrom,
        $lock: lock
    });
}

function photoLockEnforce(ret) {
    console.log("check lock" + ret.group);
    if (ret.from.id != config.admin_id) {
        db.get("SELECT * FROM managed_group WHERE id = $gid", {
            $gid: ret.group
        }, function (err, row) {
            if (err) {
                console.error(err);
                // Send Error Msg
            } else if (row.is_photo_locked == 1) {
                executor.group_setphoto(ret.group, config.group_photo_dir + ret.group + ".jpg");
            } else {
                // Output something
                controller.msg({
                    text: "#GroupPhotoChanged by @" + ret.from.username + " ( " + ret.from.id + " ) ",
                    chat_id: -(ret.group)
                });
            }
        });
    }
}

function Ban(ret) {
    // Check
    if (ret.target == config.admin_id) return;
    if (ret.target != config.admin_id && ret.target != config.bot_id)
        db.get("SELECT * FROM moderator_list WHERE modid = $uid AND gid = $gid", {
            $uid: ret.user.id,
            $gid: ret.chatfrom
        }, function (err, row) {
            if (err) {
                console.error(err);
            } else if (row === undefined) {
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
                        } else {
                            controller.msg({
                                text: "User Already Banned!",
                                chat_id: -(ret.chatfrom)
                            });
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
                        } else {
                            controller.msg({
                                text: "User Already Banned!",
                                chat_id: -(ret.chatfrom)
                            });
                        }
                    });
                }
            }
        });
}

function unBan(ret) {
    // Check
    if (ret.type == "unban") {
        db.get("SELECT * FROM banned_list WHERE userid = $uid AND gid = $gid", {
            $uid: ret.target,
            $gid: ret.chatfrom
        }, function (err, row) {
            if (err) {
                console.error(err);
            } else if (row) {
                // Check Passed.
                db.run("DELETE FROM banned_list WHERE userid = $uid AND gid = $gid", {
                    $uid: ret.target,
                    $gid: ret.chatfrom
                });
            } else {
                controller.msg({
                    text: "User is Not Banned!",
                    chat_id: -(ret.chatfrom)
                });
            }// Else: User Is Not Banned - done
        });
    } else if (ret.type == "unbanall") {
        db.get("SELECT * FROM banall_list WHERE userid = $uid", {
            $uid: ret.target
        }, function (err, row) {
            if (err) {
                console.error(err);
            } else if (row) {
                // Check Passed.
                db.run("DELETE FROM banall_list WHERE userid = $uid", {
                    $uid: ret.target
                });
            } else {
                controller.msg({
                    text: "User is Not Banned across all managed Groups!",
                    chat_id: -(ret.chatfrom)
                });
            } // Else: User is Not Banned across All - done
        });
    }
}

function Kick(ret) {
    if (ret.target != config.admin_id && ret.target != config.bot_id)
        db.get("SELECT * FROM moderator_list WHERE modid = $uid AND gid = $gid", {
            $uid: ret.user.id,
            $gid: ret.chatfrom
        }, function (err, row) {
            if (err) {
                console.error(err);
            } else if (row === undefined) {
                executor.kickuser(ret.chatfrom, ret.target);
            }
        });
}

controller.event.on('cmd_request', function (ret) {
    switch (ret.area) {
        case "any":
            switch (ret.require_permission) {
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
controller.event.on('delete_chat_photo', function (ret) {
    // Output id
    photoLockEnforce(ret);
});
controller.event.on('new_chat_title', function (ret) {
    // Check Lock - done
    console.log("check lock" + ret.group);
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
            db.run("UPDATE managed_group SET title = $title WHERE id = $gid", {
                $gid: ret.group,
                $title: ret.title
            });
        }
    });
});

controller.event.on('new_chat_photo', function (ret) {
    // Output id
    photoLockEnforce(ret);
});

controller.event.on('new_chat_participant', function (ret) {
    // Check Ban DB
    // First, check Hard-coded global ban db (Only Two User) :p ---> wfjsw/PeaceManager#1 - done
    if (ret.user.id == 68256164 || ret.user.id == 53835259 || (banlist.enabled && banlist.banlist.indexOf(ret.user.id) > -1)) {
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

    // Output User Details - done
    controller.msg({
        text: "#UserJoin @" + ret.user.username + " ( " + ret.user.id + " ) ",
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
            db.run("INSERT INTO managed_group (id, title, is_title_locked, is_photo_locked) VALUES ($id, $title, 0, 0)", {
                $id: ret.group,
                $title: ret.title
            });
            controller.msg({
                text: "PeaceManager registered in group " + ret.group,
                chat_id: -(ret.group)
            });
            controller.msg({
                text: "If you want it unregistered, just remove this bot. You will lost anything except banlists.",
                chat_id: -(ret.group)
            });
        } else if (row) {
            db.run("UPDATE managed_group SET title = $title WHERE id = $gid", {
                $gid: ret.group,
                $title: ret.title
            });
        }
    });
});

controller.event.on('left_chat_participant', function (ret) {
    if (ret.user.id == config.bot_id) {
        db.run("DELETE FROM managed_group WHERE id = $gid", {
            $gid: ret.group
        });
        db.run("DELETE FROM moderator_list WHERE gid = $gid", {
            $gid: ret.group
        });
    }
});


// First Init
executor.init(config) // Missing config
.then(function (status) {
    controller.init(config); // Missing config, either
    connected = true;
});
