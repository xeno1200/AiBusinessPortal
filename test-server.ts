import express from "express";
import { db } from "./server/db";
import { users } from "./shared/schema";

const app = express();
const port = 5001;

app.get("/test", async (req, res) => {
  try {
    // Test a simple database query
    const allUsers = await db.select().from(users);
    res.json({ success: true, users: allUsers });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Test server running at http://localhost:${port}`);
});