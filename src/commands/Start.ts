import { Message } from "node-telegram-bot-api";
import { instKeyboard } from "../lib/Keyboards";
import Command from "../structures/Command";
import User from "../structures/User";
import Cache from "../lib/Cache";

export default class TodayCommand extends Command {
    name = { command: "start" }
    sceneName = [];

    async exec(user: User, msg: Message): Promise<void> {
        let replytext = `Приветствую, ${msg.from!.username}\n\n`;

        if(msg.chat.type !== "private") {
            if(!user.group) replytext += "Конкретно у тебя не установлена некоторая важная для меня информация. Давай поговорим в личных сообщениях.";
            else replytext += "Можешь воспользоваться командами снизу:\n\n/today - Расписание на сегодня\n/tomorrow - Расписание на завтра\n/nearest - Ближайшее расписание\n\nПоддержка: @Elektroplayer\nGitHub: github.com/Elektroplayer/kubgtu_lessons_tgbot\nПоддержать меня:\nТ: 5536 9141 8751 4363\nС: 2202 2050 2291 3625";
            
            Cache.bot.sendMessage(msg.chat.id, replytext, {
                disable_web_page_preview: true
            });
        } else {
            if(!user.group) {
                user.scene = Cache.scenes.find(s => s.name == "settings")

                replytext += "У тебя не установлена некоторая важная для меня информация. Подскажи пожалуйста,\n\nКакой у тебя институт. Если твоего тут нет, значит можешь написать мне в ЛС (@Elektroplayer), чтобы я его добавил. Если что-то пошло не так, пиши туда же - я не кусаюсь.";

                Cache.bot.sendMessage(msg.chat.id, replytext, {
                    disable_web_page_preview: true,
                    reply_markup: {
                        inline_keyboard: instKeyboard,
                        resize_keyboard: true,
                    }
                });

            } else {
                replytext += "Поддержка: @Elektroplayer\nGitHub: github.com/Elektroplayer/kubgtu_lessons_tgbot\nПоддержать меня:\nТ: 5536 9141 8751 4363\nС: 2202 2050 2291 3625\n\nМожешь выбрать действие снизу.";

                user.scene = Cache.scenes.find(s => s.name == "main");

                Cache.bot.sendMessage(msg.chat.id, replytext, {
                    disable_web_page_preview: true,
                    reply_markup: {
                        keyboard: user.getMainKeyboard(),
                        resize_keyboard: true,
                    }
                });
            }
        }
    }
}