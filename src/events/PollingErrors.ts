import Event from "../structures/Event";

export default class PollingErrorsEvent extends Event {
    name = "polling_error" as BotEvents;

    exec(err: Error): void {
        console.log(err);
    }
}
