import mongoose from "mongoose";

// role = 'student' | 'university' | 'company'
// tenantId = collegeId (student/university) or companyId (company) — this is what every
// downstream query filters by, and it's baked into the access token at login time.
// refId = the Student._id when role === 'student', otherwise null.
const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["student", "university", "company"], required: true },
  tenantId: { type: String, required: true },
  refId: { type: String, default: null },
  username: { type: String, required: true, unique: true },
  email: { type: String, default: undefined, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  refreshTokenHash: { type: String, default: null },
  label: { type: String, required: true },
  needsAssessment: { type: Boolean, default: false },
});

export default mongoose.model("User", userSchema);
