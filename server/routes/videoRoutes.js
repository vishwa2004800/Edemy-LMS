import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router(); // Create Router instance


// Get the current directory name in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Video download route
router.get("/download/video/:fileName", (req, res) => {
  const filePath = path.join(__dirname, "../videos/", req.params.fileName);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "Video not found" });
  }
});

export default router;
