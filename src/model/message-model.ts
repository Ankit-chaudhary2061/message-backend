import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    imageOrVideoUrl: { type: String },
    contentType: { type: String, enum: ["text", "image", "video"], default: "text" },
    reactions:[{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        emoji: { type: String, required: true }
    }],
    messageStatus: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true })    

const Message = mongoose.model("Message", messageSchema)
export default Message