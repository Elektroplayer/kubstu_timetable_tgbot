import { Message } from "node-telegram-bot-api";
import User from "./User";

export enum MiddlewareTypes {
    Pre,
    Post,
    Test
}

export abstract class Middleware {
    type = MiddlewareTypes.Pre;

    abstract exec(user: User, msg: Message):void | number;
}