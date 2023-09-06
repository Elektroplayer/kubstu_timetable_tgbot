import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";
import { commandName } from "../lib/Utils.js";

export default class TodayCommand extends Command {
    name = commandName({ command: "showall" });
    sceneName = ["main"];

    async exec(user: User, msg: Message): Promise<void> {
        if(!user.group) {
            Cache.bot.sendMessage(msg.chat.id, "У меня нет данных о тебе. Напиши /start" + ( msg.chat.type == "group" ? " мне в личные сообщения." : "."));
            return;
        }

        let evenSchedule = await user.group.getTextFullSchedule(true);
        let oddSchedule = await user.group.getTextFullSchedule(false);

        if(!evenSchedule || !oddSchedule) {
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
                evenSchedule,
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        remove_keyboard: msg.chat.type !== "private"
                    }
                }
            );

            await Cache.bot.sendMessage(
                msg.chat.id,
                oddSchedule,
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