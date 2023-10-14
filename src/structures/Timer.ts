export default abstract class Timer {
    /**
     * Время в милисекундах
     */
    // abstract time: number;
    abstract exec(): void;
    abstract init(): void;
}