import Timer from "../structures/Timer.js";
import { CronJob } from "cron";
import Parser from "../structures/Parser.js";
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
    
                    // Обновляем расписание. Если такой группы нет, она создастся автоматически
                    await ScheduleModel.findOneAndUpdate({ group, inst_id }, { days, updateDate: new Date() }, { upsert: true })
                }
            }
        }
    
        console.log("[updater] Расписания обновлены!");
    }

    async updateTeacherSchedules() {
        console.log(`[updater] Приступаю к обновлению расписаний учителей`);

        let schedules = await ScheduleModel.find({}).exec(); // Получение всех расписаний
        let teachersSchedule:{[key: string]: ITeacherLesson[]} = {}; // Тут будут храниться пары у преподавателей
        let updateDate = new Date(); // Дата обновления (сейчас)
    
        schedules.forEach((group) => {
            if(!group.days || group.days.length == 0) return; // Если у группы нет пар, значит пропускаем её
    
            group.days.forEach((day) => {
                day.daySchedule.forEach((lesson) => {
                    if(!teachersSchedule[lesson.teacher!]) teachersSchedule[lesson.teacher!] = []; // Создаём для преподавателя массив его пар
    
                    let out:ITeacherLesson = {
                        daynum: day.daynum,
                        even: day.even,
                    
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
    
                    teachersSchedule[lesson.teacher!].push(out) // Добавляем пару
                })
            })
        })
    
        // Пары нужно отсортировать по дням, в которые они будут
        Object.keys(teachersSchedule).forEach(async (teacher) => {
            if(teacher == "Не назначен") return; // Самый популярный препод
    
            let sorted:ITeacherDay[] = [] // Тут будут хранится сортированные пары преподавателя
    
            for (let week = 1; week <= 2; week++) {
                for (let daynum = 1; daynum <= 6; daynum++) {
                    let daySchedule = teachersSchedule[teacher].filter(elm => elm.even == (week == 2) && elm.daynum == daynum) // Получаем пары в конкретный день
    
                    if(daySchedule.length == 0) continue; // Пропускаем, если их нет

                    daySchedule.sort((a, b) => a.number - b.number) // Сортируем
                    sorted.push({ daynum, daySchedule, even: week == 2 }) // Добавляем
                }
            }
    
            // Итоговое отсортированное расписание отправляем в БД
            await TeacherScheduleModel.findOneAndUpdate({ name: teacher }, { updateDate, days: sorted }, { upsert: true }).then(() => {
                console.log(`[updater] ${teacher}`)
            });            
        })
    }
}
