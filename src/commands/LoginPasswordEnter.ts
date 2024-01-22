import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";
import ExamsParser from "../structures/ExamsParser.js";

export default class TodayCommand extends Command {
    name = {}
    sceneName = ["loginpassword"];

    async exec(user: User, msg: Message): Promise<void> {
        let msgArr = msg.text?.split(":")!;

        let login = msgArr[0];
        let password = msgArr[1];

        if(!login || !password) {
            Cache.bot.sendMessage(
                msg.chat.id,
                `Проверь правильность ввода: логин:пароль. Без лишних пробелов!`,
                {
                    parse_mode: "HTML",
                    reply_markup: { remove_keyboard: msg.chat.type !== "private" }
                }
            );
            return;
        }

        let sendedMsg = await Cache.bot.sendMessage(
            msg.chat.id,
            `<i>Логинюсь...</i>`,
            {
                parse_mode: "HTML",
                reply_markup: { remove_keyboard: msg.chat.type !== "private" }
            }
        );

        let examParser = new ExamsParser(login, password);
        let parsingResult = await examParser.exec();

        Cache.bot.deleteMessage(msg.chat.id, msg.message_id)

        await Cache.bot.editMessageText(
            parsingResult ? `Успешно! Теперь ты можешь смотреть экзамены по команде /exams!` : 
            `Неправильный логин или пароль. Проверь правильность ввода: логин:пароль. Без лишних пробелов!\n\n<i>Если продолжает выскакивать ошибка, проверь, работает ли сайт. Если он работает, обратись <a href="https://t.me/Elektroplayer">мне в ЛС</a>.</i>`, {
            chat_id: sendedMsg.chat.id,
            message_id: sendedMsg.message_id,
            parse_mode: "HTML",
            disable_web_page_preview: true,
        });

        if(parsingResult) {
            user.setScene("main");

            Cache.bot.sendMessage(msg.chat.id, "Возвращаемся...", {
                disable_web_page_preview: true,
                reply_markup: {
                    keyboard: user.getMainKeyboard(),
                    resize_keyboard: true,
                }
            });
        }
    }
}