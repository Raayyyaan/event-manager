import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
