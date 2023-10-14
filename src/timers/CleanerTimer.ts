import Timer from "../structures/Timer";
import Cache from "../lib/Cache";
import { CronJob } from "cron";

export default class CleanerTimer extends Timer {
    async init() {
        new CronJob('0 00 00 * * 0-5', this.exec, null, true, 'Europe/Moscow');
    }

    async exec() {
        for(let i = 0; i < Cache.groups.length; i++) {
            Cache.groups[i].schedule = undefined;
        }
    }
}
