import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";
import SponsorMessagesMiddleware from "../middlewares/SponsorMessages.js";
import GroupTestMiddleware from "../middlewares/GroupTestMiddleware.js";

export default class TodayCommand extends Command {
    name = {
        buttons: { title: "экзамены", emoji: "" },
        command: "exams"
    };

    sceneName = ["main"];
    middlewares = [SponsorMessagesMiddleware, GroupTestMiddleware];

    async exec(user: User, msg: Message): Promise<void> {
        if(!user.group) return;

        let text;
        let schedule = await user.group.getTextExams();

        if(!schedule) text = "<b>Расписание не найдено...</b> <i>или что-то пошло не так...</i>";
        else text = schedule;
        
        Cache.bot.sendMessage(
            msg.chat.id,
            text,
            {
                parse_mode: "HTML",
                reply_markup: {
                    remove_keyboard: msg.chat.type !== "private"
                }
            }
        );
    }
}