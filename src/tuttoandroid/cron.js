const config = require('../../config');
const TeleBot = require('telebot'); // https://github.com/mullwar/telebot
const bot = new TeleBot(config('telegram').tokenTuttoAndroid);
const Database = require('better-sqlite3');
const db = new Database(config('db').pathTuttoAndroid, {fileMustExist: true}); // https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md
const Parser = require('rss-parser'); // https://www.npmjs.com/package/rss-parser
const parser = new Parser();
const html2json = require('html2json').html2json; // https://www.npmjs.com/package/html2json
const moment = require('moment');

/**
 * Ottiene gli uid degli utenti registrati nel db che vogliono ricevere i feed
 * @returns {Object}
 */
function getUserUids(){
    return db.prepare('SELECT uid FROM user WHERE wantFeed = 1;').all();
}

/**
 * Ottiene il timestamp dell'ultimo controllo effettuato
 * @returns {{timestamp: string}}
 */
function getLastCheck() {
    return db.prepare("SELECT timestamp FROM lastCheck;").get();
}

/**
 * Aggiorna la colonna 'timestamp' nel db
 * @param timestamp timestamp
 * @returns {boolean} true se UPDATE eseguito con successo, false altrimenti
 */
function updateLastCheck(timestamp) {
    let sql = db.prepare("UPDATE lastCheck SET timestamp = ?;").run(String(timestamp));
    return sql.changes > 0;
}

(async () => {
    const feed = await parser.parseURL('https://www.tuttoandroid.net/feed/');

    const ids = getUserUids();
    const lastCheckTime = getLastCheck().timestamp;

    feed.items.reverse().forEach(item => {
        if (lastCheckTime < new Date(item.pubDate).getTime()) {

            let datum = moment(item.pubDate).format("DD/MM/YYYY kk:mm");

            let text = `<b>${item.title}</b>
<i>${html2json(item.content).child[2].child[0].text}</i>
&#x1f4c6; ${datum}`;

            let replyMarkup = bot.inlineKeyboard([
                [
                    bot.inlineButton('Leggi', {url: `${item.link}`})
                ]
            ]);

            for (let i = 0; i < ids.length; i++) {
                // console.log(ids[i].uid, text);
                bot.sendMessage(ids[i].uid, text, {parseMode: 'HTML', webPreview: false, replyMarkup: replyMarkup});
            }

        }
    });

    let lastEdit = new Date(feed.items[feed.items.length - 1].pubDate).getTime();
    if (!updateLastCheck(lastEdit)) throw "Errore UPDATE timestamp lastCheck";
})();
