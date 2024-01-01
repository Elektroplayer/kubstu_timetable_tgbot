import { CallbackQuery } from "node-telegram-bot-api";
import Query from "../structures/Query.js";
import User from "../structures/User.js";
import Cache from "../lib/Cache.js";
import { groupsParser } from "../lib/Utils.js";

interface KeyboardButton {
    text: string,
    callback_data: string
}

export default class GroupQuery extends Query {
    name = ["settings_kurs"];
    sceneName = "settings";

    async exec(user: User, query: CallbackQuery): Promise<void> {
        if(!query?.message?.text) return; // не знаю как, но на всякий случай

        let db = user.dataBuffer.find(db => db.id == query.message?.message_id)

        if(!db) {
            Cache.bot.sendMessage(query.message!.chat.id, "Похоже эта кнопка себя исчерпала");
            return;
        }
    
        db.kurs = +query.data!.slice(14,query.data!.length);
    
        let text = query.message!.text;
        let groups;

        try {
            groups = await groupsParser(db.inst_id!, db.kurs!);
        } catch(err) {console.log(err)}

        let keyboard: KeyboardButton[][] = [];
        let buffer: KeyboardButton[] = [];

        if(!groups || groups!.length == 0) {
            Cache.bot.editMessageText(
                text.split("\n\n").slice(0,text.split("\n\n").length-1).join("\n\n") + "\n\nЧто-то пошло не так! Повтори попытку позже с помощью команды /start... \nЕсли проблема не уходит, обратись в поддержку: @Elektroplayer",
                {
                    chat_id: query.message.chat.id,
                    message_id: query.message.message_id,
                }
            );

            return;
        }

        for(let i = 0;i<groups.length;i++) {
            if(i%4==0 && i!=0) {
                keyboard.push(buffer);
                buffer = [];
            }
            buffer.push({
                text: groups[i].substring(3),
                callback_data: "settings_group_"+groups[i]
            });
        }

        keyboard.push(buffer);

        let now = new Date();
        let groupDate = (now.getUTCFullYear() - db.kurs + 1 - ( now.getUTCMonth() >= 6 ? 0 : 1)).toString().substring(2);

        Cache.bot.editMessageText(
            text.split("\n\n").slice(0,text.split("\n\n").length-1).join("\n\n") + `\n\nВыбери свою группу. ${groupDate}-...`,
            {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                reply_markup: {
                    inline_keyboard: keyboard
                }
            }
        );
    }
}