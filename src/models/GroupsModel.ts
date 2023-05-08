import mongoose from "mongoose";

const schema = new mongoose.Schema({
    group: {
        type: String,
        required: true,
        unique: true
    },
    timetable: {
        type: {
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
        },
        required: true
    },
    token: {
        type: String,
        default: undefined
    }
}, { collection: "groups", versionKey: false });

export default mongoose.model("groups", schema);

