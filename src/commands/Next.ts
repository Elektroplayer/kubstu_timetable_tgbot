import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command";
import User from "../structures/User";
import Cache from "../lib/Cache";
import SponsorMessagesMiddleware from "../middlewares/SponsorMessages";

export default class NearestCommand extends Command {
    name = {
        buttons: { title: "Ближайшее", emoji: "⏩"},
        command: "nearest"
    }
    
    sceneName = ["main"];
    middlewares = [SponsorMessagesMiddleware];

    async exec(user: User, msg: Message): Promise<void> {
        if(!user.group) {
            Cache.bot.sendMessage(msg.chat.id, "У меня нет данных о тебе. Напиши /start" + ( msg.chat.type == "group" ? " мне в личные сообщения." : "."));
            return;
        }

        let date = new Date();

        let schedule, events;
        for(let i=0;i<=14;i++) {
            date.setUTCDate(date.getUTCDate() + 1);

            schedule = await user.group.getTextSchedule(date.getDay(), date.getWeek()%2==0, date);
            events = await user.group.getTextEvents(date);

            if(schedule.indexOf("Пар нет! Передохни:з") == -1 || events) break;
        }
        
        let text = schedule && schedule.indexOf("Пар нет! Передохни:з") == -1 ? schedule : "<b>Ближайшего расписания не найдено...</b> <i>или что-то пошло не так...</i>";

        if(events) text += `\n\n${events}`;
        // if(events && (!user.group.token || user.token == user.group.token)) text += `\n\n${events}`;
        
        Cache.bot.sendMessage(
            msg.chat.id,
            text,
            {
                parse_mode: "HTML",
                reply_markup: {
                    remove_keyboard: msg.chat.type !== "private"
                }
            }
        );
    }
}