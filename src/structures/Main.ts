import { readdirSync } from "fs";
import Event from "./Event";
import Scene from "./Scene";
import Cache from "../lib/Cache";
import Timer from "./Timer";

export default class Main {
    scenesNames = ["main", "settings"];

    run() {
        this.initEvents();
        this.initTimers();
        this.initScenes();
    }

    async initEvents() {
        for (let dirent of readdirSync("./src/events", {withFileTypes: true})) {
            if (!dirent.name.endsWith(".ts")) continue;

            console.log(`+ Евент ${dirent.name}`);
        
            let eventClass = (await import("../events/" + dirent.name)).default;
            let event:Event = new eventClass();

            Cache.bot.on(event.name, event.exec)
        }
    }

    async initScenes() {
        this.scenesNames.forEach(sceneName => {
            console.log(`+ Сцена ${sceneName}`);

            Cache.scenes.push(new Scene(sceneName));
        })
    }

    async initTimers() {
        for (let dirent of readdirSync("./src/timers", {withFileTypes: true})) {
            if (!dirent.name.endsWith("")) continue;

            console.log(`+ Таймер ${dirent.name}`);
        
            let timerClass = (await import("../timers/" + dirent.name)).default;
            let timer:Timer = new timerClass();

            timer.init();
            // setInterval(timer.exec, timer.time);
        }
    }
}