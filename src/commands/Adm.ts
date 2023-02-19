import { Message } from "node-telegram-bot-api";
import Command from "../structures/Command.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";

export default class AdminCommand extends Command {
    name = ["/adm"];
    sceneName = ["main"];

    async exec(user: User, msg: Message): Promise<void> {
        if(user.id !== 588163528) {
            console.log(user.id);
            Cache.bot.sendMessage(msg.chat.id, "Зря ты это написал... Мои люди уже выехали за тобой, чтобы поговорить...");
            return;
        }

        let msgArr = msg.text!.split(/\s+/g);

        if(msgArr[1].toLocaleLowerCase() == "updateschedule") {
            let groupClass = Cache.groups.find(elm => elm.name == msgArr[2]);

            if(!groupClass) {
                Cache.bot.sendMessage(msg.chat.id, "Не нашёл эту группу");
                return;
            }

            let r; // response 
            if(msgArr[3]?.toLocaleLowerCase() == "true") r = groupClass.updateScheduleFromSite();
            else r = groupClass.updateSchedule();

            if(r != null) Cache.bot.sendMessage(msg.chat.id, "Ок");
            else Cache.bot.sendMessage(msg.chat.id, "Не ок!");
        }

        // Не время
        // if(msgArr[1].toLocaleLowerCase() == "clearevents") {

        //     let events = await Event.find({}).exec();

        //     events.forEach(ev => {
        //         if(ev.date < new Date().setUTCHours(0,0,0,0)) Event.deleteMany({date: ev.date});
        //     });

        //     bot.sendMessage(msg.chat.id, "Ок");
        // }
    }
}