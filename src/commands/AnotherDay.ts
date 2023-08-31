import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";
import { anotherDay } from "../lib/Keyboards.js";
import { commandName } from "../lib/Utils.js";

export default class AnotherDayCommand extends Command {
    name = [...commandName("Выбрать день", "🔀")];
    sceneName = ["main"];

    async exec(user: User, msg: Message): Promise<void> {
        if (["group", "supergroup"].includes(msg.chat.type)) return;

        if (!user.group) {
            Cache.bot.sendMessage(user.id, "У меня нет данных о тебе. Напиши /start");
            return;
        }

        Cache.bot.sendMessage(user.id, "Выбери дату", {
            reply_markup: {
                keyboard: anotherDay,
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
    }
}
