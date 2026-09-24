import mongoose from "mongoose";

const shortlistSchema = new mongoose.Schema({
  companyId: { type: String, required: true, index: true },
  studentId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
shortlistSchema.index({ companyId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("Shortlist", shortlistSchema);
