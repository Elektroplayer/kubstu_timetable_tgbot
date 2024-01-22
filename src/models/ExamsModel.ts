import mongoose from "mongoose";

const schema = new mongoose.Schema({
    inst_id: {
        type: Number,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    exams: [{
        date: Date,
        teacher: String,
        auditory: String,
        name: String
    }],
}, { collection: "exams" });

export default mongoose.model("exams", schema);