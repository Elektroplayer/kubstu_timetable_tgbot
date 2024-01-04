import Scene from "./Scene.js";
import Group from "./Group.js";
import Users from "../models/UsersModel.js";
import Cache from "../lib/Cache.js";
import { KeyboardButton } from "node-telegram-bot-api";

export default class User {
    scene?: Scene;
    group?: Group;
    notifications: boolean = false;
    emoji: boolean = true;
    showSettings: boolean = true;
    token?: string;

    /**
     * Используется для временного хранения данных при настройке
     */
    dataBuffer: {
        id: number,
        inst_id?: number,
        kurs?: number
    }[] = []

    constructor(public id:number) {}

    /**
     * Инициализация
     */
    async init() {
        let userData = await Users.findOne({userId: this.id}).exec();

        if(userData?.inst_id && userData?.group) {
            await this.setGroup(userData.group, userData.inst_id);

            this.notifications = userData?.notifications ?? false;
            this.emoji = userData?.emoji ?? true;
            this.showSettings = userData?.showSettings ?? true;
            this.token = userData?.token;
        }
    }

    /**
     * Обновление данных
     */
    async updateData(opt: { instId: number, group: string }) {
        await Users.findOneAndUpdate({userId: this.id}, { inst_id: opt.instId, group: opt.group }, { upsert: true })

        this.setGroup(opt.group, opt.instId)
    }

    /**
     * Устновка текущей группы у человека
     */
    async setGroup(group:string, inst_id:number | string) {
        this.group = Cache.groups.find(g => g.name == group)

        if(!this.group) {
            let newGroup = new Group(group, +inst_id);
            
            Cache.groups.push(newGroup);

            this.group = newGroup;
        }
    }

    /**
     * Установка токена
     */
    async setToken(token:string) {
        this.token = token;

        let userData = await Users.findOne({userId: this.id}).exec()

        if(userData) {
            userData.token = token;
            userData.save().catch(console.log);
        }
    }

    async delete() {
        return Users.findOneAndRemove({userId: this.id});
        // TODO: Сделать удаление из массива Cache.users
    }

    /**
     * Получение главной клавиатуры
     */
    getMainKeyboard():KeyboardButton[][] {
        let arr = [
            [
                {
                    text: (this.emoji ? "⏺️ " : "") + "Сегодняшнее",
                },{
                    text: (this.emoji ? "▶️ " : "") + "Завтрашнее",
                }
            ],[
                {
                    text: (this.emoji ? "⏩ " : "") + "Ближайшее"
                }, {
                    text: (this.emoji ? "🔀 " : "") + "Выбрать день",
                }
            ],[
                {
                    text: (this.emoji ? "👨‍🏫 " : "") + "Расписания учителей",
                }
            ]
        ];

        if (this.showSettings) arr.push([{ text: (this.emoji ? "⚙️ " : "") + "Настройки" }])

        return arr;
    }

    /**
     * Получение клавиатуры настроек
     */
    getSettingsKeyboard():KeyboardButton[][] {
        return [
            [
                {
                    text: this.notifications ? ( (this.emoji ? "🔕 " : "") + "Выключить напоминания") : ((this.emoji ? "🔔 " : "") + "Включить напоминания")
                }
            ],[
                {
                    text: this.emoji ? ( (this.emoji ? "🙅‍♂️ " : "") + "Выключить эмодзи") : "Включить эмодзи" // Тут нет эмодзи, потому что оно тут в любом случае будет отсутствовать
                }
            ],[
                {
                    text: this.showSettings ? ( (this.emoji ? "⚙️ " : "") + "Убрать настройки") : ((this.emoji ? "⚙️ " : "") + "Показывать настройки")
                }
            ],[
                {
                    text: (this.emoji ? "⚙️ " : "") + "Перенастроить бота"
                }
            ],[
                {
                    text: (this.emoji ? "🛑 " : "") + "Отмена"
                }
            ]
        ]
    }
}