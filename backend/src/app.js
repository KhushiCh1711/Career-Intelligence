import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";

import studentRoutes from "./routes/studentRoutes.js";
import universityRoutes from "./routes/universityRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", ...(process.env.CLIENT_ORIGIN || "").split(",").map((origin) => origin.trim()).filter(Boolean)];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Pathway API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/university", universityRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/ai", aiRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON" });
  }
  res.status(500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message || "Internal server error",
  });
});

export default app;
