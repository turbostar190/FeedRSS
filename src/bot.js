const TeleBot = require('telebot'); // https://github.com/mullwar/telebot
const bot = new TeleBot(process.env.TOKEN);

bot.on(['/toms', '/start'], (msg) => {
    let id = msg.from.id;
    console.log(`${id};`);
    // TODO: Inserimenti in database
    return msg.reply.text('Fatto! Riceverai notifiche di nuovi articoli di Tom\'s Hardware Italia proprio qui!', { asReply: true });
});

bot.start();