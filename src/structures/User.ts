import Scene from "./Scene.js";
import Group from "./Group.js";
import Users from "../models/UsersModel.js";
import Cache from "../lib/Cache.js";

export default class User {
    scene?: Scene;
    group?: Group;

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
     * Инициализация группы
     */
    async initGroup() {
        let userData = await Users.findOne({userId: this.id}).exec()

        if(userData?.inst_id && userData?.group) this.setGroup(userData.group, userData.inst_id)
    }

    /**
     * Обновление данных
     */
    async updateData(opt: { instId: number, group: string }) {
        let userData = await Users.findOne({userId: this.id}).exec()

        if(userData) {
            userData.inst_id = opt.instId;
            userData.group = opt.group;

            userData.save().catch(console.log);
        } else {
            new Users({
                userId: this.id,
                inst_id: opt.instId,
                group: opt.group
            }).save().catch(console.log);
        }

        this.setGroup(opt.group, opt.instId)
    }

    /**
     * Устновка текущей группы у человека
     */
    setGroup(group:string, inst_id:number | string) {
        this.group = Cache.groups.find(g => g.name == group)

        if(!this.group) {
            let newGroup = new Group(group, +inst_id);

            Cache.groups.push(newGroup);

            this.group = newGroup;
        }
    }
}