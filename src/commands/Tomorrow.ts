import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";
import SponsorMessagesMiddleware from "../middlewares/SponsorMessages.js";
import { commandName } from "../lib/Utils.js";

export default class TomorrowCommand extends Command {
    name = [...commandName("Завтрашнее", "▶️"), "/tomorrow", "/tomorrow@kubstu_timetable_bot"];
    sceneName = ["main"];
    middlewares = [SponsorMessagesMiddleware];

    async exec(user: User, msg: Message): Promise<void> {
        if(!user.group) {
            Cache.bot.sendMessage(msg.chat.id, "У меня нет данных о тебе. Напиши /start" + ( msg.chat.type == "group" ? " мне в личные сообщения." : "."));
            return;
        }

        let date = new Date();
        date.setUTCDate(date.getUTCDate() + 1);

        let text;
        let schedule = await user.group.getTextSchedule(date.getDay(), date.getWeek()%2==0);
        let events = await user.group.getTextEvents(date);

        if(!schedule) text = "<b>Расписание не найдено...</b> <i>или что-то пошло не так...</i>";
        else text = schedule;

        if(events) text += `\n\n${events}`;
        // if(events && (!user.group.token || user.token == user.group.token)) text += `\n\n${events}`;
        
        Cache.bot.sendMessage(
            msg.chat.id,
            text,
            {
                parse_mode: "HTML",
                reply_markup: {
                    remove_keyboard: msg.chat.type == "group"
                }
            }
        );
    }
}