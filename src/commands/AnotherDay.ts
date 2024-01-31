import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";
import { anotherDay } from "../lib/Keyboards.js";
import GroupTestMiddleware from "../middlewares/GroupTestMiddleware.js";

export default class AnotherDayCommand extends Command {
    name = { buttons: { title: "Выбрать день", emoji: "🔀" } };
    sceneName = ["main"];

    middlewares = [GroupTestMiddleware];

    async exec(user: User, msg: Message): Promise<void> {
        if (msg.chat.type !== "private") return;

        Cache.bot.sendMessage(user.id, "Выбери дату", {
            reply_markup: {
                keyboard: anotherDay,
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
    }
}
