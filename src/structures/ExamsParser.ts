import fetch from "node-fetch";
import https from "https";
import { parse } from "node-html-parser";
import ExamsModel from "../models/ExamsModel.js";

const agent = new https.Agent({
    rejectUnauthorized: false,
});

interface IExam {
    date: Date,
    teacher: string,
    auditory: string,
    name: string
}

export default class ExamParser {
    constructor(public username:string, public password:string) {}

    headers:{[key: string]: string | undefined} = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
        'Accept-Encoding': "gzip, deflate, br",
        'Connection': "Keep-Alive",
        'accept': '*/*',
        'Cache-Control': "no-cache",
        'Host': "student.kubstu.ru",
        // 'Referer': "https://student.kubstu.ru/site/login",
        'Cookie': undefined
    }

    instsDict:{[key:string]:number} = {
        "Институт нефти, газа и энергетики": 495,
        "Институт компьютерных систем и информационной безопасности": 516,
        "Институт пищевой и перерабатывающей промышленности": 490,
        "Институт экономики, управления и бизнеса": 29,
        "Институт строительства и транспортной инфраструктуры": 538,
        "Институт механики, робототехники, инженерии транспортных и технических систем": 539,
        "Институт фундаментальных наук": 540,
        "Инженерно-технологический колледж": 541,
        "Подготовительное отделение для иностранных граждан": 34,
        "Новороссийский политехнический институт": 50,
        "Армавирский механико-технологический институт": 52,
    }

    async exec() {
        // Заходим на сайт и получаем начальные куки и csrf
        let csrf = (await this.getCookieAndCsrf())?.csrf;

        if(!csrf) return false;

        // Логинимся на сайте
        let loginResult = await this.getLogin(csrf);

        if(!loginResult) return false;

        // Это всё нужно, чтобы получить куки и с помощью них посещать сайты доступные только после авторизации

        let exams = await this.getExams(); // Получаем экзамены
        let info = await this.getInfo(); // И информацию

        if(!exams || !info) return false;

        await ExamsModel.findOneAndUpdate({ group: info["Группа"], inst_id: this.instsDict[info["Институт"]] }, { exams }, { upsert: true }).catch(console.log);

        // console.log(info["Группа"], this.instsDict[info["Институт"]])

        // await ExamsModel.findOne({group: info["Группа"], inst_id: this.instsDict[info["Институт"]]}).exec();

        return true;
    }

    /**
     * Записывает данные о студенте
     */
    async getInfo() {
        let resp;
        try {
            resp = await fetch("https://student.kubstu.ru/site/obuch-info", { method: "GET", agent, headers: this.headers as HeadersInit });
        } catch (err) {
            console.log(err);
        }
        
        if(!resp || resp.status !== 200) return undefined;

        let text = await resp.text();
        let document = parse(text);
        let info:{[key: string]: string} = {}

        document.querySelectorAll(".detail-view")[0].childNodes.filter(x => x.childNodes.length != 0).forEach(elm => {
            info[elm.childNodes[0].innerText.trim()] = elm.childNodes[1].innerText.trim()
        });

        return info;
    }

    /**
     * Заходит на страницу с экзаменами и записывает их
     */
    async getExams() {
        let resp;
        try {
            resp = await fetch("https://student.kubstu.ru/site/schedule-sess", { method: "GET", agent, headers: this.headers as HeadersInit })
        } catch(err) {
            console.log(err);
        }

        if(!resp) return undefined;

        let text = await resp.text();
        let document = parse(text);
        let examsHeaders = document.querySelectorAll(".panel");
        let examsCollapse = document.querySelectorAll(".panel-collapse");
        let regex = new RegExp("(.*\..*\..*) (.*:.*:.*) \/ (.*)");
        let exams:IExam[] = [];

        let date: Date, teacher: string, auditory: string, name: string, title;
        for(let i = 0;i<examsHeaders.length;i++) {
            title = examsHeaders[i].querySelector("span")?.childNodes[0].innerText.match(regex)!;
            
            name      = title[3];
            teacher   = examsCollapse[i].querySelectorAll("p")[0].childNodes[1].innerText.trim();
            auditory  = examsCollapse[i].querySelectorAll("p")[1].childNodes[1].innerText.trim();
            date      = new Date();

            date.setUTCFullYear(+title[1].split(".")[2], (+title[1].split(".")[1])-1, +title[1].split(".")[0])
            date.setUTCHours(+title[2].split(":")[0], +title[2].split(":")[1], 0, 0)

            exams.push({ date, teacher, auditory, name });
        }

        return exams;
    }

    /**
     * Имитирует вход на сайт. Получает начальные куки и CSRF. 
     * Куки автоматически обновляются в заголовках класса.
     */
    async getCookieAndCsrf() {
        let resp
        try {
            resp = await fetch("https://student.kubstu.ru/site/login", { method: "GET", agent, headers: this.headers as HeadersInit})
        } catch (err) {
            console.log(err);
        }

        if(!resp) return undefined;

        let cookie  = resp.headers.get('set-cookie');
        let text    = await resp.text();
        let csrf    = parse(text).querySelector('meta[name="csrf-token"]')?.getAttribute("content")

        if(!csrf) return undefined;

        if(cookie !== null) {
            let cookieArr = cookie.split(/, |; /);

            cookie = `${cookieArr[0]}; ${cookieArr[3]}`;

            this.headers['Cookie'] = cookie;
        }

        return {cookie, csrf};
    }

    getBody(csrf:string) {
        return `LoginForm[username]=${this.username}&LoginForm[password]=${this.password}&LoginForm[rememberMe]=0&_csrf-backend=${csrf}`
    }

    /**
     * Логин. Используя логин и пароль в конструкторе класса достаёт и сохраняет куки в заголовках класса.
     * Возвращает false если что-то пошло не так 
     */
    async getLogin(csrf:string) {
        let resp;
        try {
            resp = await fetch("https://student.kubstu.ru/site/login", { method: "POST", redirect: 'manual', agent, headers: this.headers as HeadersInit, body: this.getBody(csrf) });
        } catch (err) {
            console.log(err);
        }
        
        if(!resp || resp.status !== 302) return false;

        let cookie  = resp.headers.get('set-cookie');
        
        if(cookie !== null) {
            let cookieArr = cookie.split(/, |; /);

            cookie = `${cookieArr[0]}; ${cookieArr[9]}`;

            this.headers['Cookie'] = cookie;
        }

        return true;
    }
}
