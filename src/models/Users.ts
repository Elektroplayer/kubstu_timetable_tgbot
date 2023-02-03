import mongoose from "mongoose";

const schema = new mongoose.Schema({
    userId: String,
    inst_id: Number,
    group: String,
    notifications: {
        type: Boolean,
        default: false
    }
}, { collection: "users" });

export default mongoose.model("users", schema);