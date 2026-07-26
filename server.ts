import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Voice Parsing Endpoint (Fallback/Enhancement for speech-to-text)
app.post("/api/parse-voice", async (req, res) => {
  try {
    const { transcript, catalog } = req.body;

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "Transcript required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ 
        error: "GEMINI_API_KEY not set on server. Using fallback local fuzzy parser." 
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format top catalog items for prompt
    const productList = Array.isArray(catalog)
      ? catalog.map((p: any) => `- ID: ${p.id} | Nama: ${p.name} | Satuan: ${p.unit} | Harga: ${p.sellPrice}`).join("\n")
      : "";

    const prompt = `Anda adalah asisten AI kasir toko kelontong di Indonesia.
Kasir (ibu-ibu pasar) mengucapkan pesan berikut saat bertransaksi:
"${transcript}"

Daftar katalog barang yang tersedia di toko:
${productList}

Tugas Anda:
1. Ekstrak setiap barang dan kuantitas (jumlah) dari ucapan kasir.
2. Tangani pengucapan dialek Indonesia/Jawa (misal: "satu", "dua", "loro", "mie sedap", "galon aqua", "minyak", "gula").
3. Cocokkan nama barang dari ucapan kasir dengan barang terdekat di daftar katalog toko di atas.
4. Jika persis/sangat yakin, berikan productId. Jika ragu, berikan daftar suggestedProducts.

Kembalikan respon DALAM FORMAT JSON HANYA TANPA MARKDOWN BACKTICKS:
{
  "parsedItems": [
    {
      "spokenQuery": "string",
      "quantity": number,
      "matchedProductId": "string atau null",
      "matchedProductName": "string atau null",
      "confidence": number (0.0 - 1.0),
      "suggestedProductIds": ["string ID"]
    }
  ],
  "correctedTranscript": "string ucapan yang sudah dirapikan"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json(parsed);

  } catch (error: any) {
    console.error("Error in /api/parse-voice:", error);
    return res.status(500).json({ error: error?.message || "Failed to parse voice transcript with AI" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[POS Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
