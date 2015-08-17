// JavaScript source code

var config = 
 {
    cli: {
        socket: "/home/example/tg/telegram.sock" // Run telegram with "-S telegram.sock -I" and possibly "-d"
    },
    token: "", // Bot API token
    admin_id: 0, // Your User ID
    bot_id: 0, // The first few numbers in token
    db_file: "" // Point to pmlite.db
};

module.exports = config;