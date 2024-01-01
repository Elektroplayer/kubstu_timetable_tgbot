import Timer from "../structures/Timer.js";
import { CronJob } from "cron";
import Parser from "../structures/Parser.js";
import { groupsParser, insts } from "../lib/Utils.js";
import ScheduleModel from "../models/ScheduleModel.js";

export default class NotificationsTimer extends Timer {
    async init() {
        new CronJob('0 59 23 * * 6', this.exec, null, true, 'Europe/Moscow'); // В субботу в 23:59
    }

    async exec() {
        let inst_id: number;
        let groups: string[] | undefined;
        let parser: Parser;
        let group: string;
        let days: Day[] | undefined;
    
        for(let i=0;i<insts.length;i++) {
            console.log(`[updater] ${insts[i]}:`)
    
            for(let kurs=1;kurs<=6;kurs++) {
                inst_id  = insts[i];
                groups   = undefined; // Очищаем текущую группу
    
                try {
                    groups = await groupsParser(inst_id, kurs) // Парсим все группы с сайта
                } catch (err) {
                    console.log(`[updater] [!] Не удалось для ${inst_id}, ${kurs} курс`)
                }
                    
                if(!groups || !groups.length) continue;
    
                for(let g=0;g<groups.length;g++) {
                    group  = groups[g];
                    parser = new Parser(inst_id, kurs, group);
                    days   = undefined; // Очистка
    
                    try {
                        days = await parser.parseSchedule(); // Парсим расписание группы с сайта
                    } catch (err) {
                        console.log(`[updater] [!] Не удалось для ${inst_id} ${kurs} курс, группа ${group}!`)
                    }
    
                    if(!days) continue;
    
                    console.log(`[updater] [+] ${inst_id}, ${kurs}, ${group}`);
    
                    await ScheduleModel.findOneAndUpdate({ group, inst_id }, { // Обновляем расписание. Если такой группы нет, она создастатся автоматически
                        days,
                        updateDate: new Date()
                    }, { upsert: true })
                }
            }
        }
    
        console.log("[updater] Done!")
    }
}
