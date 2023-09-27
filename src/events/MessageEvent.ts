import TelegramBot from "node-telegram-bot-api";
import Event from "../structures/Event";
import Cache from "../lib/Cache";
import { MiddlewareTypes } from "../structures/Middleware"
import { commandName } from "../lib/Utils";

export default class MessageEvent extends Event {
    name = "message" as BotEvents;

    async exec(msg: TelegramBot.Message): Promise<void> {
        if (!msg.from || !msg.text || msg.chat.type == "channel") return;

        let user = await Cache.getUser(msg.from.id);

        if (!user.scene) user.scene = Cache.scenes.find((s) => s.name == "main");

        let command = user.scene!.commands.find((c) => commandName(c.name).includes(msg.text!) ) ?? user.scene!.commands.find(c => commandName(c.name).length == 0);

        if (!command) {
            if (msg.chat.type == "private") await Cache.bot.sendMessage(msg.chat.id, "Неизвестная команда", {
                reply_markup: {
                    keyboard: user.getMainKeyboard(),
                    resize_keyboard: true,
                }
            });
        } else {

            // Отправка сообщения в консоль происходит уже после проверки на существование команды (19 строка)
            // Если сообщение не является командой, я не увижу ваше сообщение
            // В добавок в группе можно отключить доступ к сообщениям у бота, команды будут работать

            console.log( `${msg.from?.username ?? msg.from?.first_name ?? "Нет ника (?)"}, ${msg.from.id}: ${user.group?.name ?? "Не выбрана"}; ${msg.text};` );

            await command.middlewares.filter(mw => mw.type == MiddlewareTypes.Pre).forEach(async mw => {
                await mw.exec(user, msg);
            });

            await command.exec(user, msg);

            await command.middlewares.filter(mw => mw.type == MiddlewareTypes.Post).forEach(async mw => {
                await mw.exec(user, msg);
            });
        }
    }
}