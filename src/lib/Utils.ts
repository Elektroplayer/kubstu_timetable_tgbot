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

// let opts = {
//     names: [
//         {
//             name: "привет",
//             emoji: ""
//         }
//     ],
//     command: ""
// }

export function commandName(opts:{ name?: Array<{ title: string, emoji?: string } | string> | { title: string, emoji?: string } | string, command?: string }) {
//function commandName(opts) {
    let arr = [];

    if(opts.name) {
        if(Array.isArray(opts.name)) {
            opts.name.forEach(elm => {
                if(typeof elm == "string") arr.push(elm);
                else {
                    arr.push(elm.title);
                    if(elm.emoji) arr.push(`${elm.emoji} ${elm.title}`);
                }
            });
        } else {
            if(typeof opts.name == "string") arr.push(opts.name);
            else {
                arr.push(opts.name.title);
                if(opts.name.emoji) arr.push(`${opts.name.emoji} ${opts.name.title}`);
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