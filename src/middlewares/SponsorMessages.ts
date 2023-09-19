import { Message } from "node-telegram-bot-api";
import { Middleware, MiddlewareTypes } from "../structures/Middleware";
import User from "../structures/User";
import Cache from "../lib/Cache";

class SponsorMessagesMiddleware extends Middleware {
    type = MiddlewareTypes.Post;

    users:{id: number, count: number}[] = [];

    messages = [
        "Нравится бот? Скинь пару рублей со стипендии на карту)\n\nИнфа в /start",
        "Нравится? Я старался)\n\nЕсли хочешь меня обрадовать, можешь помочь оплачивать хост. Напиши команду /start.",
        "Про ошибки/предложения не стесняйся писать мне в ЛС: @Elektroplayer",
        "Иногда я сюда кидаю новости про бота: @kubstu_schedule_news",
        // "<b>ВНИМАНИЕ! ЧЕРЕЗ НЕДЕЛЮ БОТ ЗАКРЫВАЕТСЯ!</b>\n\nШутка) Но не очень приятная. Я много плачу за хост, поэтому чтобы такого реально не произошло, в /start можешь узнать, как меня можно поддержать."
    ];

    exec(user: User, msg: Message): void {
        if(msg.chat.type !== "private") return;

        let thisUser = this.users.find(u => u.id == user.id);

        if(!thisUser) {
            this.users.push({
                id: user.id,
                count: 1
            });
        } else if(thisUser.count > 5) {
            let num = Math.floor( Math.random() * this.messages.length );

            console.log(` + донатное сообщение ${num}.`);

            Cache.bot.sendMessage(
                msg.chat.id,
                this.messages[num],
                { parse_mode: "HTML" }
            );

            thisUser.count = 1;
        } else thisUser.count++;
    }
}

export default new SponsorMessagesMiddleware()