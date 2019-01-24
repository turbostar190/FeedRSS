const config = require('../config');
const TeleBot = require('telebot'); // https://github.com/mullwar/telebot
const bot = new TeleBot(config('telegram').token);
const Database = require('better-sqlite3');
const db = new Database(config('db').path, {fileMustExist: true}); // https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md

/**
 * Verifica se l'utente ha già utilizzato il bot in precedenza, in caso negativo salva il suo uid
 * @param {number} uid uid della chat/utente
 * @returns {Object} {{success: boolean, chatId: number}}
 */
function isNew(uid) {
    let idUser = String(uid);
    let row = db.prepare('SELECT id, COUNT(*) AS rep FROM user WHERE uid = ?;').get(idUser);

    if (row.rep === 0) {
        let sql = db.prepare("INSERT INTO user (uid, wantFeed) VALUES (?, 0);").run(idUser);
        return {success: true, chatId: sql.lastInsertRowid};
    } else {
        return {success: false, chatId: String(row.id)};
    }
}

/**
 * Aggiorna l'utente per rispecchiare l'intenzione di ricevere notifiche
 * @param {number} uid uid della chat/utente
 * @param {boolean} sub true se si sottoscrive, false altrimenti
 * @returns {boolean}
 */
function wantFeed(uid, sub) {
    let sql = db.prepare("UPDATE user SET wantFeed = ? WHERE uid = ?;").run(sub ? 1 : 0, String(uid));
    return sql.changes > 0;
}

bot.on('/start', (msg) => {
    if (isNew(msg.from.id).success) {
        msg.reply.text("Benvenuto nel bot! Per iniziare a ricevere le notifiche degli ultimi feed digita /toms.");
    } else {
        msg.reply.text("Felice di risentirti nel bot! Per ricevere le notifiche degli ultimi feed digita /toms.");
    }
});

bot.on('/toms', msg => {
    if (wantFeed(msg.from.id, true)) {
        return msg.reply.text("Perfetto! Riceverai notifiche per nuovi articoli di Tom's Hardware Italia proprio qui!");
    } else {
        return msg.reply.text("Si è verificato un errore durante l'elaborazione della richiesta! Riprova più tardi.");
    }
});

bot.on('/stop', msg => {
    if (wantFeed(msg.from.id, false)) {
        return msg.reply.text("Non riceverai più notifiche per nuovi articoli di Tom's Hardware Italia!");
    } else {
        return msg.reply.text("Si è verificato un errore durante l'elaborazione della richiesta! Riprova più tardi.");
    }
});

bot.start();
