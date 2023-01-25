import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";

export default class TodayCommand extends Command {
    name = ["/update", "/update@kubstu_timetable_bot"];
    sceneName = ["main"];

    async exec(user: User, msg: Message): Promise<void> {
        if(!user.group) {
            Cache.bot.sendMessage(msg.chat.id, "У меня нет данных о тебе. Напиши /start" + ( msg.chat.id !== user.id ? " мне личные сообщения." : "."));
            return;
        }

        let r = user.group.updateScheduleFromSite() // response
        
        Cache.bot.sendMessage(
            msg.chat.id,
            r == null ? "Произошла ошибка обновления! Возможно, сайт не работает." : "Расписание обновлено принудительно!",
            {
                parse_mode: "HTML",
                reply_markup: {
                    remove_keyboard: msg.chat.type == "group"
                }
            }
        );
    }
}