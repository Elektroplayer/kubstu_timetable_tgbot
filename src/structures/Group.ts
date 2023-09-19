import Parser from "./Parser";
import Schedules from "../models/GroupsModel";
import Events from "../models/EventsModel";

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

    async getTextSchedule(day = new Date().getDay(), week = new Date().getWeek()%2==0) {
        let out = "";
        let daySchedule = await this.getRawSchedule(day, week);

        if(daySchedule == null) return "<b>Произошла ошибка<b>\nСкорее всего сайт с расписанием не работает...";

        daySchedule.forEach(elm => {
            out += `\n\n${elm.number} пара: ${elm.name} [${elm.paraType}]\n  Время: ${elm.time}`;
            if(elm.teacher) out += `\n  Преподаватель: ${elm.teacher}`;
            if(elm.auditory) out += `\n  Аудитория: ${elm.auditory}`;
            if(elm.percent) out += `\n  Процент группы: ${elm.percent}`;
            if(elm.flow) out += "\n  В лекционном потоке";
            if(elm.remark) out += `\n  Примечание: ${elm.remark}`;
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

        if(schedule == null || schedule == undefined) return "<b>Произошла ошибка<b>\nСкорее всего сайт с расписанием не работает...";
        
        out += `<u><b>${week ? "ЧЁТНАЯ" : "НЕЧЁТНАЯ"} НЕДЕЛЯ:</b></u>\n`;
        schedule.days.filter(elm => elm.even == week).forEach(day => {
            out += `\n<b>${this.parser.days[day.daynum]}:</b>\n`;
            
            day.daySchedule.forEach(lesson => {
                out += `  ${lesson.number}. ${lesson.name} [${lesson.paraType}] (${lesson.auditory})\n`
            });
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
        let dbResponse = await Schedules.findOne({group: this.name}).exec()

        if(dbResponse) {
            if(new Date().valueOf() - dbResponse.timetable.updateDate?.valueOf()! < 1000 * 60 * 60 * 24)
                return this.setSchedule(dbResponse.timetable.days as Day[], dbResponse.timetable.updateDate)
            else {
                try {
                    let days = await this.parser.parseSchedule();

                    dbResponse.timetable.days = days;
                    dbResponse.timetable.updateDate = new Date();

                    dbResponse.save().catch(console.log);

                    return this.setSchedule(days);
                } catch (error) {
                    return this.setSchedule(dbResponse.timetable.days as Day[], dbResponse.timetable.updateDate!)
                }
            }
        } else {
            try {
                let days = await this.parser.parseSchedule()

                new Schedules({
                    group: this.name,
                    timetable: {
                        days,
                        updateDate: new Date()
                    },
                    token: this.genToken()
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
                dbResponse.timetable.days = days;
                dbResponse.timetable.updateDate = new Date();

                dbResponse.save().catch(console.log)
            } else {
                new Schedules({
                    group: this.name,
                    timetable: {
                        days,
                        updateDate: new Date()
                    },
                    token: this.genToken()
                }).save().catch(console.log);
            }

            return this.setSchedule(days);
        } catch (error) {
            return null
        }
    }

    async initToken() {
        this.token = (await Schedules.findOne({group: this.name}).exec())?.token;
    }
}