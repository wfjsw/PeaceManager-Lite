// JavaScript source code

var config = 
 {
    cli: {
        socket: "/home/example/tg/telegram.sock" // Run telegram with "-S telegram.sock -I" and possibly "-d"
    },
    token: "", // Bot API token
    admin_id: 0, // Your User ID
    bot_id: 0, // The first few numbers in token
    db_file: "", // Point to pmlite.db
    group_photo_dir: "", // Point to a folder contains group photos (WITH '/' APPEND). See photo_lock_readme.txt
    dry_run: false // DEBUG USE: DISABLE ALL FUNCTION, USEFUL WHEN DATABASE DO BOOM.
};

module.exports = config;