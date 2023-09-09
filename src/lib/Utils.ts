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

// export function commandName(name:string, emoji:string) {
//     return [name, `${emoji} ${name}`]
// }

export function commandName(opts: CommandName) {
//function commandName(opts) {
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
    commandName
};