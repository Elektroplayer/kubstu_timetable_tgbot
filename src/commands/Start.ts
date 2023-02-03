import { Message } from "node-telegram-bot-api";
import { instKeyboard, mainKeyboard } from "../lib/Keyboards.js";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";

export default class TodayCommand extends Command {
    name = ["/start", "/start@kubstu_timetable_bot"];
    sceneName = [];

    async exec(user: User, msg: Message): Promise<void> {
        let replytext = `Приветствую, ${msg.from!.username}\n\n`;

        if(msg.chat.type == "group") {
            if(!user.group) replytext += "Конкретно у тебя не установлена некоторая важная для меня информация. Давай поговорим в личных сообщениях.";
            else replytext += "Можешь воспользоваться командами снизу:\n\n/today - Расписание на сегодня\n/tomorrow - Расписание на завтра\n/nearest - Ближайшее расписание\n\nПоддержка: @Elektroplayer_xXx\nДонат: qiwi.com/n/ELECTRO303\nGitHub: github.com/Elektroplayer/kubgtu_lessons_tgbot";
            
            Cache.bot.sendMessage(msg.chat.id, replytext, {
                disable_web_page_preview: true
            });
        } else {
            if(!user.group) {
                user.scene = Cache.scenes.find(s => s.name == "settings")

                replytext += "У тебя не установлена некоторая важная для меня информация. Подскажи пожалуйста,\n\nКакой у тебя институт. Если твоего тут нет, значит он может появиться в будущем";

                Cache.bot.sendMessage(msg.chat.id, replytext, {
                    disable_web_page_preview: true,
                    reply_markup: {
                        inline_keyboard: instKeyboard,
                        resize_keyboard: true,
                    }
                });

            } else {
                replytext += "Поддержка: @Elektroplayer_xXx\nДонат: qiwi.com/n/ELECTRO303\nGitHub: github.com/Elektroplayer/kubgtu_lessons_tgbot\n\nМожешь выбрать действие снизу.";

                user.scene = Cache.scenes.find(s => s.name == "main");

                Cache.bot.sendMessage(msg.chat.id, replytext, {
                    disable_web_page_preview: true,
                    reply_markup: {
                        keyboard: mainKeyboard,
                        resize_keyboard: true,
                    }
                });
            }
        }
    }
}