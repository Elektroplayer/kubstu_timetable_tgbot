import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command";
import User from "../structures/User";
import Cache from "../lib/Cache";
import Users from "../models/UsersModel";
import { commandName } from "../lib/Utils";

export default class TodayCommand extends Command {
    name = { buttons: [
        { title: "Включить напоминания", emoji: "🔔" },
        { title: "Выключить напоминания", emoji: "🔕"}
    ]};

    sceneName = ["settings"];

    async exec(user: User, msg: Message): Promise<void> {
        let userData = await Users.findOne({userId: user.id}).exec();
        let condition = commandName({ buttons: { title: "Включить напоминания", emoji: "🔔" } }).includes(msg.text!);

        userData!.notifications = condition;
        user.notifications = condition;

        userData!.save().catch(console.log);

        user.scene = Cache.scenes.find(s => s.name == "main");

        let text = `Напоминания включены.\n\nТеперь бот каждый день (кроме субботы) через час после пар будете автоматически писать вам расписание на завтра.`;

        Cache.bot.sendMessage(msg.chat.id,
            condition ? text : `Напоминания выключены.`,
            {
                reply_markup: {
                    keyboard: user.getMainKeyboard(),
                    resize_keyboard: true,
                    //one_time_keyboard: true
                }
            }
        );
    }
}