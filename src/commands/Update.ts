import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";

export default class TodayCommand extends Command {
    name = ["/update", "/update@kubstu_timetable_bot"];
    sceneName = ["main"];

    async exec(user: User, msg: Message): Promise<void> {
        if(!user.group) {
            Cache.bot.sendMessage(msg.chat.id, "У меня нет данных о тебе. Напиши /start" + ( msg.chat.type == "group" ? " мне в личные сообщения." : "."));
            return;
        }

        if(user.group.schedule && new Date().valueOf() - user.group.schedule?.updateDate.valueOf() < 1000 * 60 * 60) {
            Cache.bot.sendMessage(
                msg.chat.id,
                "<b>Не так быстро!</b> Прошло меньше часа с момента последнего обновления!",
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        remove_keyboard: msg.chat.type == "group"
                    }
                }
            );

            return;
        }

        let r = user.group.updateScheduleFromSite() // response
        
        Cache.bot.sendMessage(
            msg.chat.id,
            r == null ? "Произошла ошибка обновления! Возможно, сайт не работает." : "Расписание обновлено принудительно!",
            {
                reply_markup: {
                    remove_keyboard: msg.chat.type == "group"
                }
            }
        );
    }
}