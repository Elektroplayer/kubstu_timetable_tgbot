import Timer from "../structures/Timer.js";
import { CronJob } from "cron";
import Parser from "../structures/OLectionsParser.js";
import { groupsParser, insts } from "../lib/Utils.js";
import ScheduleModel from "../models/ScheduleModel.js";
import TeacherScheduleModel from '../models/TeacherScheduleModel.js';

export default class UpdaterTimer extends Timer {
    async init() {
        new CronJob('0 59 23 * * 3,6', this.exec, null, true, 'Europe/Moscow', this); // В среду и субботу в 23:59
        // new CronJob('0 */5 * * * *', this.exec, null, true, 'Europe/Moscow', this); // Каждые пять минут
    }

    async exec() {
        await this.updateSchedules();
        await this.updateTeacherSchedules();
    }

    async updateSchedules() {
        console.log("[updater] Приступаю к обновлению расписаний!")

        let inst_id: number;
        let groups: string[] | undefined;
        let parser: Parser;
        let group: string;
        let days: IDay[] | undefined;
        let bulk = ScheduleModel.collection.initializeOrderedBulkOp();
        let updateDate = new Date();
    
        for(let i=0;i<insts.length;i++) {
            console.log(`[updater] ${insts[i]}:`)
    
            for(let kurs=1;kurs<=6;kurs++) {
                inst_id  = insts[i];
                groups   = undefined; // Очищаем массив групп
    
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
    
                    // console.log(`[updater] [+] ${inst_id}, ${kurs}, ${group}`);
    
                    // Обновляем расписание. Если такой группы нет, она создастся автоматически
                    // await ScheduleModel.findOneAndUpdate({ group, inst_id }, { days, updateDate: new Date() }, { upsert: true })
                    bulk.find({ group, inst_id }).upsert().updateOne({ $set: { days, updateDate } })
                }
            }
        }

        // Отправляем изменения в БД
        await bulk.execute().then(() => console.log(`[updater] Расписания обновлены!`), console.log);
    }

    async updateTeacherSchedules() {
        console.log(`[updater] Приступаю к обновлению расписаний преподавателей!`);

        let schedules = await ScheduleModel.find({}).exec(); // Получение всех расписаний
        let teachersSchedule:{[key: string]: ITeacherDay[]} = {}; // Тут будут храниться расписания у преподавателей
        let updateDate = new Date(); // Дата обновления (сейчас)
    
        schedules.forEach((group) => {
            if(!group.days || group.days.length == 0) return; // Если у группы нет пар, значит пропускаем её
    
            group.days.forEach((day) => {
                day.daySchedule.forEach((lesson) => {
                    if(lesson.teacher == "Не назначен") return;
    
                    if(!teachersSchedule[lesson.teacher!]) teachersSchedule[lesson.teacher!] = []; // Создаём для преподавателя массив его дней, если этого массива нет
                    
                    // Переменная содержащая инфу о паре
                    let out:ITeacherLesson = {   
                        group: group.group,
                        number: lesson.number!,
                        time: lesson.time!,
                        name: lesson.name!,
                        paraType: lesson.paraType!,
                        auditory: lesson.auditory!,
                    }
    
                    if(lesson.remark) out.remark = lesson.remark;
                    if(lesson.percent) out.percent = lesson.percent;
                    if(lesson.period) out.period = lesson.period;
                    if(lesson.flow) out.flow = lesson.flow;
                    
                    // Тут добавляем сам день, а если он уже есть, то вставляем в него пару
                    if(!teachersSchedule[lesson.teacher!].find(elm => elm.daynum == day.daynum && elm.even == day.even))
                        teachersSchedule[lesson.teacher!].push({daynum: day.daynum, even: day.even, daySchedule: [out]})
                    else teachersSchedule[lesson.teacher!].find(elm => elm.daynum == day.daynum && elm.even == day.even)!.daySchedule.push(out)
                })
            })
        })
    
        // Обновляем БД
        let bulk = TeacherScheduleModel.collection.initializeOrderedBulkOp()
    
        Object.keys(teachersSchedule).forEach(teacher => bulk.find({ name: teacher }).upsert().updateOne({ $set: { updateDate, days: teachersSchedule[teacher] }}))
    
        await bulk.execute().then(() => console.log(`[updater] Расписания преподавателей обновлены!`), console.log);
    }
}
