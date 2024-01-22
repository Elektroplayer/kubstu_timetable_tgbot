import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";

export default class TodayCommand extends Command {
    name = { buttons: [
        { title: "Обновить экзамены", emoji: "⚙️"}
    ]};

    sceneName = ["settings"];

    async exec(user: User, msg: Message): Promise<void> {
        user.setScene("loginpassword");

        Cache.bot.sendMessage(msg.chat.id,
            `Информация о предстоящих экзаменах находится только в одном месте - в твоём личном кабинете, поэтому для обновления информации об экзаменах требуется твой логин и пароль. Напиши его в формате логин:пароль или нажми "Отмена".\n\nЭто безопасно? <a href="https://github.com/Elektroplayer/kubstu_timetable_tgbot#по-поводу-ввода-паролей">Да</a>.\nЕсть другие варианты? <a href="https://t.me/kubstu_schedule_news/51">Возможно</a>.`,
            {
                reply_markup: {
                    keyboard: [[{ text: (user.emoji ? "🛑 " : "") + "Отмена" }]],
                    resize_keyboard: true,
                    //one_time_keyboard: true
                },
                parse_mode: "HTML",
                disable_web_page_preview: true,
            }
        );
    }
}