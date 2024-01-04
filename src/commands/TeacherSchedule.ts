import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";

export default class TodayCommand extends Command {
    name = { buttons: [
        { title: "Расписания преподавателей", emoji: "👨‍🏫" },
        { title: "преподаватели", emoji: "" }
    ]};
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

        user.scene = Cache.scenes.find(s => s.name == "teachers");

        let schedule = await user.group.getFullRawSchedule();
        let teachers: string[] = [];

        if(schedule) {
            schedule.days.forEach(day => {
                day.daySchedule.forEach(lesson => {
                    if(lesson.teacher !== "Не назначен" && !teachers.includes(lesson.teacher!)) teachers.push(lesson.teacher!);
                })
            })
        }

        let buttons = teachers.map(name => this.buttonFormat(this.nameFormat(name)))
        let keyboard:( {text: string}[] )[] = []

        buttons.forEach((elm, i) => {
            if(keyboard[Math.floor(i/2)]) keyboard[Math.floor(i/2)].push(elm);
            else keyboard[Math.floor(i/2)] = [elm];
        })

        Cache.bot.sendMessage(
            msg.chat.id,
            "Выбери преподавателя из списка или введи его ФИО полностью без ошибок\n\n<i>Расписание может быть не точным</i>",
            {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard,
                    resize_keyboard: true,
                    remove_keyboard: msg.chat.type !== "private"
                }
            }
        );
    }
}