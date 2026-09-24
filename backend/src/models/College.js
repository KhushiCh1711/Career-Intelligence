import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
  _id: { type: String }, // e.g. "ccsu" — human-readable tenant id, used everywhere as the scope key
  name: { type: String, required: true },
  tag: { type: String, required: true },
}, { _id: false });

export default mongoose.model("College", collegeSchema);
