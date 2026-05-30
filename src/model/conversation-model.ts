import mongoose from "mongoose"
const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    unReadCounts: { type: Number, default: 0 },
    lastMessageTime: { type: Date },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

const Conversation = mongoose.model("Conversation", conversationSchema)
export default Conversation