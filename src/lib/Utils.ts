// Нужно для самих кнопок и чтобы они нажимались
export const days = [
    "Нечёт Пн",
    "Нечёт Вт",
    "Нечёт Ср",
    "Нечёт Чт",
    "Нечёт Пт",
    "Нечёт Сб",
];
export const daysEven = [
    "Чёт Пн",
    "Чёт Вт",
    "Чёт Ср",
    "Чёт Чт",
    "Чёт Пт",
    "Чёт Сб",
];

export function weekNumber(date: Date = new Date()) {
    let startDate = new Date(date);

    startDate.setUTCHours(0, 0, 0, 0)

    if(date.getMonth() > 5) {
        // Ставим второе сентября. Первое праздник
        startDate.setUTCMonth(8, 2);

        // Находим дату понедельника текущей недели
        startDate.setUTCDate(2-startDate.getUTCDay()+1) 

        // Находим разницу между данной датой и датой первого дня недели в мс.
        let diff = date.valueOf() - startDate.valueOf();
        
        // Переводим в недели, округляем в большую сторону и выводим.
        return Math.round(diff / (1000*60*60*24*7)) + 1;
    } else {
        // TODO: Доделать во втором семестре.
        return null;
    }
}

export function commandName(opts: CommandName) {
    let arr = [];

    if(opts.buttons) {
        if(Array.isArray(opts.buttons)) {
            opts.buttons.forEach(elm => {
                if(typeof elm == "string") arr.push(elm);
                else {
                    arr.push(elm.title);
                    if(elm.emoji) arr.push(`${elm.emoji} ${elm.title}`);
                }
            });
        } else {
            if(typeof opts.buttons == "string") arr.push(opts.buttons);
            else {
                arr.push(opts.buttons.title);
                if(opts.buttons.emoji) arr.push(`${opts.buttons.emoji} ${opts.buttons.title}`);
            }
        }
    }

    if(opts.command) arr.push(`/${opts.command}`, `/${opts.command}@kubstu_timetable_bot`);

    return arr;
}

export default {
    days,
    daysEven,
    commandName,
    weekNumber
};