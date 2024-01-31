import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";
import GroupTestMiddleware from "../middlewares/GroupTestMiddleware.js";

export default class TodayCommand extends Command {
    name = { command: "showall" };
    sceneName = ["main"];
    middlewares = [GroupTestMiddleware];

    async exec(user: User, msg: Message): Promise<void> {
        if(!user.group) return;

        let date = new Date();

        let schedule1 = await user.group.getTextFullSchedule(date.getWeek()%2==0);
        let schedule2 = await user.group.getTextFullSchedule(date.getWeek()%2==1);

        if(!schedule1 || !schedule2) {
            Cache.bot.sendMessage(
                msg.chat.id,
                "<b>Расписание не найдено...</b> <i>или что-то пошло не так...</i>",
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        remove_keyboard: msg.chat.type !== "private"
                    }
                }
            );

            return;
        } else {
            await Cache.bot.sendMessage(
                msg.chat.id,
                schedule1,
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        remove_keyboard: msg.chat.type !== "private"
                    }
                }
            );

            await Cache.bot.sendMessage(
                msg.chat.id,
                schedule2,
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        remove_keyboard: msg.chat.type !== "private"
                    }
                }
            );
        }
    }
}