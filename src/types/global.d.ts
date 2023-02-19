import TelegramBot from "node-telegram-bot-api"

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_URI: string;
            TOKEN: string;
        }
    }

    interface Date {
        getWeek(): number;
    }

    interface Lesson {
        number: number,
        time: string,
        name: string,
        paraType: string,
        teacher?: string,
        auditory?: string,
        remark?: string,
        percent?: string,
        flow?: boolean
    }

    interface Day {
        daynum: number,
        even: boolean,
        daySchedule: Lesson[]
    }
    
    interface Schedule {
        updateDate: Date,
        days: Day[]
    }

    // Костыль, но работает
    type BotEvents = TelegramBot.MessageType | 'message'
}

export {};