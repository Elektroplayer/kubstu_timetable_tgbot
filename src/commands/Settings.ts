import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";
import { settingsKeyboard } from "../lib/Keyboards.js";
import Users from "../models/UsersModel.js";

export default class TodayCommand extends Command {
    name = ["⚙️ Настройки", "/settings", "/settings@kubstu_timetable_bot"];
    sceneName = ["main"];

    async exec(user: User, msg: Message): Promise<void> {
        if (msg.chat.type == "group") {
            Cache.bot.sendMessage(msg.chat.id, "Настройки доступны только в личных сообщениях.");

            return;
        }

        let userData = await Users.findOne({userId: user.id}).exec()

        if (!userData) {
            Cache.bot.sendMessage(msg.chat.id, "Сначала введи свои данные! /start");

            return;
        }

        user.scene = Cache.scenes.find(s => s.name == "settings");

        Cache.bot.sendMessage(msg.chat.id, "Выбери, что стоит настроить", {
            reply_markup: {
                keyboard: settingsKeyboard(userData?.notifications ?? false),
                remove_keyboard: true,
                resize_keyboard: true,
                //one_time_keyboard: true
            }
        });
    }
}