// test-delete.js
import fetch from "node-fetch"; // Instalar com: npm install node-fetch@3

const API_URL = "http://localhost:8080/api/consultas/cancelar/10";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJDb25zdWx0b2RheSBBUEkiLCJzdWIiOiJtYXJpYUBleGVtcGxvLmNvbSJ9.5UGDEsAg6W4RlrK_-9jimVTEhnSx441QJMWswO_ommc"; // copie do localStorage

async function testarDelete() {
  console.log("🧪 Enviando requisição DELETE para:", API_URL);

  try {
    const res = await fetch(API_URL, {
      method: "DELETE",
      headers: {
        // OBS: não envia Content-Type, exatamente como o browser deve fazer
        Authorization: `Bearer ${TOKEN}`,
        Origin: "http://127.0.0.1:5500", // simula o frontend
      },
    });

    console.log("Status:", res.status);
    console.log("Headers:", res.headers.raw());

    const text = await res.text();
    console.log("Body:", text || "(sem conteúdo)");
  } catch (err) {
    console.error("❌ Erro ao enviar requisição:", err);
  }
}

testarDelete();
