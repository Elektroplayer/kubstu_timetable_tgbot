import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";
import { instKeyboard } from "../lib/Keyboards.js";

export default class TodayCommand extends Command {
    name = { buttons: { title: "Перенастроить бота", emoji: "⚙️" } }
    sceneName = ["settings"];

    async exec(user: User, msg: Message): Promise<void> {
        if (msg.chat.type !== "private") {
            Cache.bot.sendMessage(msg.chat.id, "Настройки доступны только в личных сообщениях.");

            return;
        }

        let replyText = "Включен режим настройки, укажи заново: \n\nКакой у тебя институт. Если твоего тут нет, значит он может появиться в будущем";

        Cache.bot.sendMessage(msg.chat.id, replyText, {
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: instKeyboard,
                remove_keyboard: true
            }
        });
    }
}