import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  packageRange: { type: String, required: true },
  requiredSkills: { type: Object, required: true }, // e.g. { JavaScript: 60, React: 50 }
});

const companySchema = new mongoose.Schema({
  _id: { type: String }, // e.g. "infosys"
  name: { type: String, required: true },
  color: { type: String, required: true },
  roles: [roleSchema], // small, bounded list — embedding avoids a join for every match query
}, { _id: false });

export default mongoose.model("Company", companySchema);
