import { readdirSync } from "fs";
import Command from "./Command";
import Query from "./Query";

export default class Scene {
    commands: Command[] = [];
    queries: Query[] = [];

    constructor(public name: string) {
        this.importCommands();
        this.importQueries();
    }

    async importQueries() {
        for (let dirent of readdirSync("./src/queries/", {withFileTypes: true})) {
            if (!dirent.name.endsWith("")) continue;
        
            let queryClass = (await import("../queries/" + dirent.name)).default;
            let query:Query = new queryClass();

            if(query.sceneName == this.name) this.queries.push(query);
        }
    }

    async importCommands() {
        for (let dirent of readdirSync("./src/commands/", {withFileTypes: true})) {
            if (!dirent.name.endsWith("")) continue;
        
            let commandClass = (await import("../commands/" + dirent.name)).default;
            let command:Command = new commandClass();

            if(command.sceneName.length == 0 || command.sceneName.includes(this.name)) this.commands.push(command);
        }
    }
}