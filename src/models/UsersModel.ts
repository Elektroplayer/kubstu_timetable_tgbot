import mongoose from "mongoose";

const schema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    inst_id: Number,
    group: String,
    notifications: {
        type: Boolean,
        default: false
    },
    emoji: {
        type: Boolean,
        default: true
    },
    token: {
        type: String,
        default: undefined
    }
}, { collection: "users" });

export default mongoose.model("users", schema);