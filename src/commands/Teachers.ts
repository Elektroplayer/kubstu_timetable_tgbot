import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";

export default class TodayCommand extends Command {
    name = { command: "teachers" };
    sceneName = ["main"];

    nameFormat(name:string) {
        let nameArr = name.split(" ");

        return `${nameArr[0]} ${nameArr[1][0]}. ${nameArr[2][0]}.`
    }

    buttonFormat(text:string) {
        return {text}
    }

    async exec(user: User, msg: Message): Promise<void> {
        if(!user.group) {
            Cache.bot.sendMessage(msg.chat.id, "У меня нет данных о тебе. Напиши /start" + ( msg.chat.type != "private" ? " мне в личные сообщения." : "."));
            return;
        }

        let schedule = await user.group.getFullRawSchedule();
        let lessons:{[key:string]: { [key: string]: string[] }} = {};

        if(schedule) {
            schedule.days.forEach(day => {
                day.daySchedule.forEach(lesson => {
                    if(!lesson.teacher || lesson.teacher == "Не назначен") return;

                    if(!lessons[lesson.name]) lessons[lesson.name] = {}
                    if(!lessons[lesson.name][lesson.teacher]) lessons[lesson.name][lesson.teacher] = []
                    if(!lessons[lesson.name][lesson.teacher].includes(lesson.paraType)) lessons[lesson.name][lesson.teacher].push(lesson.paraType)
                });
            });
        }

        let out = `<b><u>ПРЕДМЕТЫ И ПРЕПОДАВАТЕЛИ</u></b>\n\n`

        for(let lesson in lessons) {
            out += `<b>${lesson}:</b>`
            for(let teacher in lessons[lesson]) {
                out += `\n  ${teacher} [${lessons[lesson][teacher].join(', ')}]`
            }
            out += `\n\n`
        }

        Cache.bot.sendMessage(
            msg.chat.id,
            out,
            {
                parse_mode: "HTML",
                reply_markup: { remove_keyboard: msg.chat.type !== "private" }
            }
        );
    }
}