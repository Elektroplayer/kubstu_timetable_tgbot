import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";
import { mainKeyboard } from "../lib/Keyboards.js";

export default class SelectingDayCommand extends Command {
    name = [
        "Нечёт Пн",
        "Нечёт Вт",
        "Нечёт Ср",
        "Нечёт Чт",
        "Нечёт Пт",
        "Нечёт Сб",
        "Чёт Пн",
        "Чёт Вт",
        "Чёт Ср",
        "Чёт Чт",
        "Чёт Пт",
        "Чёт Сб",
    ];
    sceneName = ["main"];

    async exec(user: User, msg: Message): Promise<void> {
        if (!user.group) {
            Cache.bot.sendMessage(
                user.id,
                "У меня нет данных о тебе. Напиши /start"
            );
            return;
        }

        if (msg.chat.type == "group") return;

        let text;
        let day       = (this.name.indexOf(msg.text!) + 1) % 6 || 6;
        let week      = this.name.indexOf(msg.text!) >= 6;
        let schedule  = await user.group.getTextSchedule( day, week );

        if(!schedule) text = "<b>Расписание не найдено...</b> <i>или что-то пошло не так...</i>";
        else text = schedule;
        
        Cache.bot.sendMessage(
            msg.chat.id,
            text,
            {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: mainKeyboard,
                    resize_keyboard: true
                }
            }
        );
    }
}
