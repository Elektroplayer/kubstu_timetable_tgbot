import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command";
import User from "../structures/User";
import Cache from "../lib/Cache";

export default class TodayCommand extends Command {
    name = { buttons: { title: "Отмена", emoji: "🛑" } };
    sceneName = ["settings"];

    async exec(user: User, msg: Message): Promise<void> {
        user.scene = Cache.scenes.find(s => s.name == "main");

        Cache.bot.sendMessage(msg.chat.id, "Возвращаемся...", {
            disable_web_page_preview: true,
            reply_markup: {
                keyboard: user.getMainKeyboard(),
                resize_keyboard: true,
            }
        });
    }
}