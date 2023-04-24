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

export function commandName(name:string, emoji:string) {
    return [name, `${emoji} ${name}`]
}

export default {
    days,
    daysEven,
    commandName
};