import mongoose from "mongoose";

const schema = new mongoose.Schema({
    group: String,
    updateDate: Date,
    days: [{
        daynum: Number,
        even: Boolean,
        daySchedule: [{
            number: Number,
            time: String,
            name: String,
            paraType: String,
            teacher: String,
            auditory: String,
            remark: String,
            percent: String,
            flow: Boolean
        }]
    }]
}, { collection: "schedules" });

export default mongoose.model("schedules", schema);