import { CallbackQuery } from "node-telegram-bot-api";
import Query from "../structures/Query.js";
import User from "../structures/User.js";
import https from "https";
import fetch from "node-fetch";
import Cache from "../lib/Cache.js";

interface KeyboardButton {
    text: string,
    callback_data: string
}

export default class GroupQuery extends Query {
    name = ["settings_kurs"];
    sceneName = "settings";

    /**
     * Парсит группы с сайта для данного института и курса и возвращает массив с ними
     */
    async groupsParser(inst_id: number | string, kurs: number | string) {
        let now = new Date();
        let date = (now.getUTCFullYear() - (now.getUTCMonth() >= 6 ? 0 : 1)).toString();

        let url = `https://elkaf.kubstu.ru/timetable/default/time-table-student-ofo?iskiosk=0&fak_id=${inst_id}&kurs=${kurs}&ugod=${date}`;
    
        let res = await fetch(url, {
            headers: {
                "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
            },
            agent: new https.Agent({ rejectUnauthorized: false })
        });
    
        let text = await res.text();
        let matches = text.match(/<option.+<\/option>/g);

        if(!matches) return;

        let groups = matches.slice( matches.indexOf("<option value=\"\">Выберите группу</option>")+1, matches.length )
            .map(elm => {
                let r = elm.substring(elm.indexOf(">")+1, elm.length);
                r = r.substring(0, r.indexOf("<"));
                return r;
            });
    
        return groups;
    }

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
            groups = await this.groupsParser(db.inst_id!, db.kurs!);
        } catch(err) {console.log(err)}

        let keyboard: KeyboardButton[][] = [];
        let buffer: KeyboardButton[] = [];

        if(!groups) {
            Cache.bot.editMessageText(
                text.split("\n\n").slice(0,text.split("\n\n").length-1).join("\n\n") + "\n\nЧто-то пошло не так! Повтори попытку позже... \nЕсли проблема не уходит, обратись в поддержку: @Elektroplayer",
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