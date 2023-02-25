import mongoose from "mongoose";

const schema = new mongoose.Schema({
    groups: [String],
    kurses: [Number],
    inst_ids: [Number],
    name: String,
    date: Date,
    evTime: String,
    note: {
        type: String,
        default: null
    }
}, { collection: "events" });

export default mongoose.model("events", schema);