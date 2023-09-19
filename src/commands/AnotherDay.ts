import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command";
import User from "../structures/User";
import Cache from "../lib/Cache";
import { anotherDay } from "../lib/Keyboards";

export default class AnotherDayCommand extends Command {
    name = { buttons: { title: "Выбрать день", emoji: "🔀" } };
    sceneName = ["main"];

    async exec(user: User, msg: Message): Promise<void> {
        if (msg.chat.type !== "private") return;

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
