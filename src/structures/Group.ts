import Parser from "./Parser.js";
import Schedules from "../models/ScheduleModel.js";
import Groups from "../models/GroupsModel.js";
import Events from "../models/EventsModel.js";
import { weekNumber } from "../lib/Utils.js";

export default class Group {
    kurs: number;
    parser: Parser;
    schedule?: Schedule;
    token?: string;

    constructor(public name: string, public instId: number) {
        let year = +(name[0]+name[1])
        let now  = new Date();

        this.kurs    = now.getUTCFullYear() - 2000 - (now.getUTCMonth() >= 6 ? 0 : 1) - year + 1; // FIXME: Будет работать до 2100 года

        this.parser  = new Parser(instId, this.kurs, name);
    }

    async init() {
        await this.initToken()
    }

    async getRawSchedule(day = new Date().getDay(), week = new Date().getWeek()%2==0) {
        if(!this.schedule || new Date().valueOf() - this.schedule.updateDate?.valueOf()! > 1000 * 60 * 60 * 24) {
            let r = await this.updateSchedule();
            if(r == null) return null;
        }

        let daySchedule = this.schedule!.days.find(elm => elm.daynum == day && elm.even == week)?.daySchedule ?? [];

        return daySchedule;
    }

    async getTextSchedule(day = new Date().getDay(), week = new Date().getWeek()%2==0, date?: Date) {
        let out = "";
        let para = "";
        let daySchedule = await this.getRawSchedule(day, week);
        let weekNum = date ? weekNumber(date) : null;

        if(daySchedule == null) return "<b>Произошла ошибка<b>\nСкорее всего сайт с расписанием не работает...";

        daySchedule.forEach(elm => {
            para += `\n\n${elm.number} пара: ${elm.name} [${elm.paraType}]\n  Время: ${elm.time}`;
            if(elm.teacher) para += `\n  Преподаватель: ${elm.teacher}`;
            if(elm.auditory) para += `\n  Аудитория: ${elm.auditory}`;
            if(elm.percent) para += `\n  Процент группы: ${elm.percent}`;
            if(elm.flow) para += "\n  В лекционном потоке";
            if(elm.period) para += `\n  Период: ${elm.period}`;
            if(elm.remark) para += `\n  Примечание: ${elm.remark}`;

            if(elm.period && weekNum) {
                let period = [+elm.period.split(" ")[1], +elm.period.split(" ")[3]]

                if(period[0] > weekNum || period[1] < weekNum) para = `<i>${para}</i>`;
            }

            out += para;
            para = "";
        });

        return `<b>${this.parser.days[day]} / ${week ? "Чётная" : "Нечётная"} неделя</b>` + (!out ? "\nПар нет! Передохни:з" : out);
    }

    
    async getRawFullSchedule() {
        if(!this.schedule || new Date().valueOf() - this.schedule.updateDate?.valueOf()! > 1000 * 60 * 60 * 24) {
            let r = await this.updateSchedule();
            if(r == null) return null;
        }

        return this.schedule
    }

    async getTextFullSchedule(week:boolean) {
        let out = "";
        let schedule = await this.getRawFullSchedule();
        let F = (date:Date) => `${date.getUTCDate()}.${date.getUTCMonth()}.${date.getUTCFullYear()}`;
        
        let dict:{[index: string]: string} = {
            "Лабораторная": "Лаб",
            "Практика": "Прак",
            "Лекция": "Лек"
        }
        
        if(schedule == null || schedule == undefined) return null; // "<b>Произошла ошибка<b>\nСкорее всего сайт с расписанием не работает...";
        
        let date = new Date();

        date.setUTCHours(0, 0, 0, 0);
        date.setUTCDate(date.getUTCDate() - date.getUTCDay() + 1); // Находим понедельник

        if(date.getWeek()%2==0 != week) date.setUTCDate(date.getUTCDate()+7);

        let num = weekNumber(date);

        out += `<u><b>${week ? "ЧЁТНАЯ" : "НЕЧЁТНАЯ"} НЕДЕЛЯ | №${num}:</b></u>\n`;
        schedule.days.filter(elm => elm.even == week).forEach(day => {
            out += `\n<b>${this.parser.days[day.daynum]} | ${F(date)}</b>\n`;
            
            day.daySchedule.forEach(lesson => {
                out += `  ${lesson.number}. ${lesson.name} [${dict[lesson.paraType] ?? lesson.paraType}] (${lesson.auditory})\n`
            });

            date.setUTCDate(date.getUTCDate()+1)
        });

        return out;
    }


    async getTextEvents(date = new Date()): Promise<string | null> {
        date.setUTCHours(0,0,0,0);

        // События ищутся так, чтобы они или совпадали по дате или были между начальной конечной датой,
        // при этом если у события есть список групп, курсов или институтов, для которых предназначается событие,
        // то группе, под эти критерии не подходящей, событие показываться не будет.
        let filter = {
            $or: [
                {
                    date: date
                }, {
                    startDate: { $lte: date }, endDate: { $gte: date }
                }
            ],
            $and: [
                {
                    $or: [ { groups: undefined }, { groups: this.name } ]
                }, {
                    $or: [ { kurses: undefined }, { kurses: this.kurs } ]
                }, {
                    $or: [ { inst_ids: undefined }, { inst_ids: this.instId } ]
                }
            ]
        }

        let dayEvents = await Events.find(filter);
        let out = dayEvents.reduce((acc, elm, i) => acc + `\n\n${i+1}. <b>${elm.name}</b>` + (elm.note ? `\n  ${elm.note.replace("\n", "\n  ")}` : ""), "")

        return out ? ("<b>СОБЫТИЯ:</b>" + out) : null;
    }

    /**
     * Устанавливает новое расписание
     */
    setSchedule(days: Day[], updateDate = new Date()) {
        this.schedule = { updateDate, days };

        return this.schedule;
    }

    /**
     * Генерирует 32-символьный токен
     */
    genToken() {
        let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
        let token = "";
        for (var i=0; i<32; i++) {
            let j = Math.floor(Math.random() * (chars.length-1));
            token += chars[j];
        }
        return `${this.name}:${token}`
    }

    /**
     * Ищет расписание.
     * Если оно есть в БД и оно не устарело, устанавливает его.
     * Если оно есть в БД, но оно устарело, парсит информацию с сайта и обновляет расписание в БД (при этом если сайт не работает, даёт что есть ничего не обновляя).
     * Если записи в БД нет, парсит расписание и создаёт запись в БД.
     * Если сайт не работает и в БД записей нет, выдаёт null.
     */
    async updateSchedule() {
        let dbResponse = await Schedules.findOne({group: this.name, inst_id: this.instId}).exec()

        if(dbResponse) {
            if(new Date().valueOf() - dbResponse.updateDate?.valueOf()! < 1000 * 60 * 60 * 24)
                return this.setSchedule(dbResponse.days as Day[], dbResponse.updateDate)
            else {
                try {
                    let days = await this.parser.parseSchedule();

                    dbResponse.days = days;
                    dbResponse.updateDate = new Date();

                    dbResponse.save().catch(console.log);

                    return this.setSchedule(days);
                } catch (error) {
                    return this.setSchedule(dbResponse.days as Day[], dbResponse.updateDate!)
                }
            }
        } else {
            try {
                let days = await this.parser.parseSchedule()

                new Schedules({
                    group: this.name,
                    inst_id: this.instId,
                    // timetable: {
                    days,
                    updateDate: new Date()
                    // },
                    // token: this.genToken()
                }).save().catch(console.log);

                return this.setSchedule(days);
            } catch (error) {
                return null
            }
        }
    }

    async updateScheduleFromSite() {
        try {
            let days = await this.parser.parseSchedule()

            let dbResponse = await Schedules.findOne({group: this.name}).exec()

            if(dbResponse) {
                dbResponse.days = days;
                dbResponse.updateDate = new Date();

                dbResponse.save().catch(console.log)
            } else {
                new Schedules({
                    group: this.name,
                    inst_id: this.instId,
                    // timetable: {
                    days,
                    updateDate: new Date()
                    // },
                    // token: this.genToken()
                }).save().catch(console.log);
            }

            return this.setSchedule(days);
        } catch (error) {
            return null
        }
    }

    async initToken() {
        let groupInfo = await Groups.findOne({group: this.name, inst_id: this.instId}).exec()

        if(groupInfo) this.token = groupInfo?.token;
        else {
            this.token = this.genToken()

            new Groups({
                group: this.name,
                inst_id: this.instId,
                token: this.token
            }).save().catch(console.log);
        }
    }
}