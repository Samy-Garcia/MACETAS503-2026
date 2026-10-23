import { Schema, model } from "mongoose";

const subscriberSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true }
}, {
    timestamps: true,
    strict: false
});

export default model("Subscriber", subscriberSchema);
