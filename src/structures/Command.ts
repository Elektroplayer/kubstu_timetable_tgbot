import User from "./User";
import { Message } from "node-telegram-bot-api";
import { Middleware } from "./Middleware";

export default abstract class Command {
    abstract name: CommandName;
    abstract sceneName: string[];

    middlewares:Middleware[] = [];

    abstract exec(user: User, msg: Message): Promise<void>;
}