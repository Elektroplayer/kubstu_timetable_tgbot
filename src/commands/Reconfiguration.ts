import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";
import { instKeyboard } from "../lib/Keyboards.js";
import { commandName } from "../lib/Utils.js";

export default class TodayCommand extends Command {
    name = [...commandName("Перенастроить бота", "⚙️")];
    sceneName = ["settings"];

    async exec(user: User, msg: Message): Promise<void> {
        if (msg.chat.type !== "private") {
            Cache.bot.sendMessage(msg.chat.id, "Настройки доступны только в личных сообщениях.");

            return;
        }

        // user.scene = Cache.scenes.find(s => s.name == "settings");

        let replytext = "Включен режим настройки, укажи заново: \n\nКакой у тебя институт. Если твоего тут нет, значит он может появиться в будущем";

        Cache.bot.sendMessage(msg.chat.id, replytext, {
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: instKeyboard,
                remove_keyboard: true
            }
        });
    }
}