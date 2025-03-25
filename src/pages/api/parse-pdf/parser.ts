import { NextApiRequest, NextApiResponse } from "next";
import pdfParse from "pdf-parse";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  
    const file = req.body.file; // Expecting base64 or binary data
  
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }
  
    try {
      const buffer = Buffer.from(file, "base64"); // Convert base64 to Buffer
      const data = await pdfParse(buffer);
      
      res.status(200).json({ text: data.text });
    } catch (error) {
      console.error("Error parsing PDF:", error);
      res.status(500).json({ error: "Failed to parse PDF" });
    }
  }