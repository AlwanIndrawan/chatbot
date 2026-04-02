const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   GEMINI API (CHAT AI)
========================= */
const GEMINI_API_KEY = "isi dengan GEMINI_API_KEY";

app.post("/chat", async (req, res) => {

  try {

    const userText = req.body.message;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Anda adalah pegawai pada Kantor Wilayah Direktorat Jenderal Imigrasi Sulawesi Selatan.
Tugas Anda memberikan informasi layanan keimigrasian kepada tamu secara singkat, jelas, dan langsung ke inti.

Gunakan bahasa yang sopan, profesional, dan mudah dipahami.
Hindari penggunaan simbol seperti *, tanda pagar, atau format poin.
Jawaban disusun dalam kalimat biasa, bukan daftar.

Tidak perlu menggunakan sapaan waktu seperti selamat pagi, siang, atau sore.
Tidak perlu menggunakan kata sapaan seperti bapak atau ibu.
Gunakan kalimat netral dan langsung ke informasi.

Jika informasi tidak tersedia atau kurang jelas, arahkan untuk menghubungi petugas terkait atau datang langsung ke kantor.
Fokus hanya pada informasi yang relevan dengan pertanyaan.

Pertanyaan:
${userText}`
          }]
        }]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, jawaban tidak tersedia.";

    res.json({ reply });

  } catch (error) {

    console.log("ERROR GEMINI:");
    console.log(error.response?.data || error.message);

    res.json({
      reply: "asisten sedang mengalami gangguan, terima kasih."
    });

  }

});


/* =========================
   ELEVENLABS (TEXT TO SPEECH)
========================= */
const ELEVEN_API_KEY = "isi dengan ELEVEN_API_KEY";
const VOICE_ID = "UctQUaK5Mczht9A9CPnU"; // voice stabil

app.post("/tts-eleven", async (req, res) => {

  try {

    const text = req.body.text;

    const response = await axios({
      method: "POST",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        "xi-api-key": ELEVEN_API_KEY,
        "Content-Type": "application/json"
      },
      data: {
        text: text,
        model_id: "eleven_multilingual_v2"
      },
      responseType: "arraybuffer"
    });

    // 🔥 CEK: apakah ini benar-benar audio?
    const contentType = response.headers["content-type"];

    if (!contentType || !contentType.includes("audio")) {
      console.log("❌ Bukan audio dari Eleven:");
      console.log(response.data.toString());

      return res.status(500).json({
        error: "TTS gagal"
      });
    }

    res.set({
      "Content-Type": "audio/mpeg"
    });

    res.send(response.data);

  } catch (error) {

    console.log("❌ ERROR ELEVEN:");
    console.log(error.response?.data?.toString() || error.message);

    res.status(500).json({
      error: "TTS gagal"
    });

  }

});


/* =========================
   SERVER
========================= */
app.listen(3000, () => {
  console.log("🚀 Server jalan di http://localhost:3000");
});
