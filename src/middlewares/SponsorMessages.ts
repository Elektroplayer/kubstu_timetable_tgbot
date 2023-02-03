import { Message } from "node-telegram-bot-api";
import { Middleware, MiddlewareTypes } from "../structures/Middleware.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";

class SponsorMessagesMiddleware extends Middleware {
    type = MiddlewareTypes.Post;

    users:{id: number, count: number}[] = [];

    messages = [
        "Нравится бот? Поддержи рублём!\nqiwi.com/n/ELECTRO303",
        "Обычно закидывают на чай, но сюда закидывают на хост и шаурму)\nqiwi.com/n/ELECTRO303",
        "Про ошибки/предложения можно написать сюда: @Elektroplayer_xXx",
        "Иногда я сюда кидаю новости про бота: @kubstu_schedule_news"
    ];

    exec(user: User, msg: Message): void {
        if(msg.chat.type == "group") return;

        let thisUser = this.users.find(u => u.id == user.id);

        if(!thisUser) {
            this.users.push({
                id: user.id,
                count: 0
            });
        } else if(thisUser.count > 7) {
            console.log(" + донатное сообщение.");

            Cache.bot.sendMessage(
                msg.chat.id,
                this.messages[ Math.floor( Math.random() * this.messages.length ) ],
                { parse_mode: "HTML" }
            );

            thisUser.count = 0;
        } else thisUser.count++;
    }
}

export default new SponsorMessagesMiddleware()