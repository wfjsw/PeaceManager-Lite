# PeaceManager-Lite

Bot to manage Groupchats.

## Install Cookbook

1. First, clone `https://github.com/vysheng/tg.git` to your server.
2. Then, clone this project elsewhere.
3. run telegram-cli for one time to initate your credential.
4. register a bot at @Botfather (WARNING: DISABLE THE PRIVACY MODE OR THIS BOT WILL NOT WORK!)
5. copy config.example.js to config.js, then edit content inside. (socket path is at `/where/you/clone/tg/telegram.sock` if follow this instruction)
6. Open an screen, run `bin/telegram-cli -S telegram.sock -I`
7. `npm install`
8. `node index`

You are done!

## Usage

Add your registered bot to group you own, then ask `/help`
