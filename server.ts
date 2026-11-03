import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { ATTRACTIONS, LOCAL_FOODS } from "./src/data";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3002);

  app.use(express.json());
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // API Chat route using Gemini API Key
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages array specified" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured on the server. Please add your Gemini API Key in the Settings > Secrets configuration panel." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Serialize location facts & OTOP details for grounding system instruction
      const attractionsContext = ATTRACTIONS.map(a => 
        `- **${a.name}** (${a.locationCategory}): ${a.desc}. ระยะทาง: ${a.distance}. ประวัติตำนานท้องถิ่น: ${a.historySummary}. ไฮไลท์วัฒนธรรม: ${a.culturalHighlights}. เวลาเดินทางแนะนำ: ${a.bestTime}. สิ่งควรรู้: ${a.needToKnow}. เรื่องเล่าไกด์ทัวร์: ${a.audioStory}. พิกัดบนแผนที่: ละติจูด ${a.lat}, ลองจิจูด ${a.lng}`
      ).join("\n");

      const otopContext = LOCAL_FOODS.map(f => 
        `- **${f.name}**: ${f.desc}. ราคาแนะนำ: ${f.price}`
      ).join("\n");

      const systemInstruction = `คุณคือ "Thong Dee Go Buddy" คู่หูผู้ช่วย AI นำเที่ยวเมืองรอง อำเภอพิชัย จังหวัดอุตรดิตถ์ ต้อนรับนักท่องเที่ยวอย่างอบอุ่นและมีชีวิตชีวา ตอบคำถามเป็นภาษาไทยด้วยน้ำเสียงน่ารัก เป็นกันเอง สุภาพ มีหางเสียงลงท้ายด้วย "ครับ" หรือ "คร้าบ" เสนอตัวดูแลช่วยเหลือเสมอ
คุณมีฐานข้อมูลอ้างอิงอย่างเป็นทางการของพื้นที่อำเภอพิชัย จังหวัดอุตรดิตถ์ ดังต่อไปนี้:

**1. สถานที่ท่องเที่ยวและจุดสำคัญในอำเภอพิชัย (Attractions):**
${attractionsContext}

**2. ของกิน OTOP และเมนูแฮนด์เมดเด่นของชุมชน:**
${otopContext}

กติกาและขอบเขตในการให้ข้อมูลของคุณ:
1. คุณต้องยึดถือข้อมูลข้างต้นเป็นความจริงสูงสุดในการแนะนำและตอบคำถามเกี่ยวกับอำเภอพิชัย เช่น แนะนำขนมวงโบราณคุณยาย (แป้งคลุกมันเทศคลุกน้ำตาลอ้อยเคี่ยว ร้อนๆ เหนียวหนึบ), ไส้กรอกหมูสมุนไพรรสเค็มเด็ด, วัดหน้าพระธาตุ, สะพานรถไฟปรมินทร์บ้านดารา (จุดชมวิวแม่น้ำน่านที่สวยเด่น), ศาลเจ้าแม่ทับทิมพิชัย ยึดตามคำบรรยาย ประวัติตำนาน และเรื่องเล่าของแอป 
2. แนะนำตัวว่าคุณคือ "Thong Dee Go Buddy" คู่หูนำเที่ยวส่วนตัว หากแอปมีพาสปอร์ตท่องเที่ยว (Digital Passport) หรือสแตมป์ด้วยตราประทับ QR แสตมป์ หรือโหมดความปลอดภัย (Safety Mode) สามารถแนะนำให้ผู้ใช้สนุกกับการเก็บแสตมป์หรือการอุ่นใจแชร์พิกัดและปุ่ม SOS ได้ตามความเหมาะสมกับบทสนทนา
3. แสดงคำตอบโดยใช้ Markdown ที่จัดหน้าได้งดงาม สดใส สแกนอ่านง่าย ใช้สัญลักษณ์ Emoji น่ารักๆ ที่สอดคล้องกับเมืองไทยและการท่องเที่ยว เช่น 🐘, 🏯, 🍜, 🍩, ⚔️, 🚂, 🏮 เพื่อกระตุ้นความน่าดึงดูด
4. หากพวกเขาถามคำถามที่ไม่มีข้อมูลในข้างต้นพยายามโยงและปรับจูนเข้าสู่ของกินหรือจุดเด่นในอำเภอพิชัย เพื่อช่วยกระตุ้นการท่องเที่ยวเมืองรองอุตรดิตถ์อย่างกระตือรือร้น`;

      // Map incoming ChatMessages to the model format (role: "user" | "model")
      // Only include the last 15 messages to stay within prompt boundaries safely
      const recentMessages = messages.slice(-15);
      const contents = recentMessages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "ขออภัยด้วยครับ บัดดี้มองไม่เห็นคำตอบ ลองถามแบบอื่นกับบัดดี้ดูนะคร้าบ 🐘";
      res.json({ text: replyText });

    } catch (err: any) {
      console.error("Gemini API backend error:", err);
      res.status(500).json({ error: err?.message || "ระบบบัดดี้ AI ขัดข้องชั่วคราว ลองใหม่อีกครั้งนะครับ" });
    }
  });

  // AI Trip Generation endpoint
  app.post("/api/trip-planner/generate", async (req, res) => {
    try {
      const { interests, duration, pace, startPoint, specialRequest, locations } = req.body;

      if (!Array.isArray(locations) || locations.length === 0) {
        return res.status(400).json({ error: "No locations provided" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `คุณคือ AI วางแผนการท่องเที่ยวอัจฉริยะสำหรับจังหวัดอุตรดิตถ์ อำเภอพิชัย
กรุณาสร้างแผนการท่องเที่ยว (TripPlanResult) จากข้อมูลสถานที่ท่องเที่ยวจริงดังต่อไปนี้:
${JSON.stringify(locations, null, 2)}

ข้อมูลความต้องการของผู้ใช้:
- ความสนใจที่เลือก (interests): ${JSON.stringify(interests)}
- ระยะเวลา (duration): ${duration} (เช่น half-day, 1-day, 2-days)
- สไตล์/ความเร็ว (pace): ${pace} (เช่น relaxed, balanced, packed)
- จุดเริ่มต้น (startPoint): ${startPoint || "ไม่ระบุ"}
- คำขอพิเศษ (specialRequest): ${specialRequest || "ไม่ระบุ"}

ข้อกำหนดในการสร้างตารางเวลา (stops):
- สำหรับ "half-day": แนะนำให้มี 3-4 จุดเช็คอิน (ตารางเวลาประมาณ 09:00, 10:30, 12:00 หรือปรับตามเหมาะสม)
- สำหรับ "1-day": แนะนำให้มี 4-6 จุดเช็คอิน (ตารางเวลาประมาณ 09:00, 10:30, 12:00, 14:00, 15:30 หรือปรับตามเหมาะสม)
- สำหรับ "2-days": แนะนำให้มี 6-8 จุดเช็คอิน โดยแบ่งตารางเวลาเป็น วันที่ 1 (Day 1) และ วันที่ 2 (Day 2) (ตารางเวลาขึ้นต้นด้วย "วันที่ 1 - 09:00", "วันที่ 2 - 10:30" เป็นต้น)

สำหรับแต่ละจุดท่องเที่ยว (stops) ต้องเลือกจากสถานที่จริงในรายการ 'locations' เท่านั้น โดยดึงข้อมูล id ของสถานที่ไปใส่ใน 'placeId', ดึง name ไปใส่ใน 'name', ดึง locationCategory ไปใส่ใน 'category', ดึง desc ไปใส่ใน 'description', ดึง image ไปใส่ใน 'imageUrl', ดึง lat ไปใส่ใน 'latitude', ดึง lng ไปใส่ใน 'longitude' และเขียน 'note' ให้สอดคล้องกับความสนใจและสไตล์ที่เลือก

กรุณาส่งผลลัพธ์เป็น JSON ที่มีโครงสร้างตรงตามประเภทนี้เท่านั้น ห้ามมีคำอธิบายอื่นใดนอกเหนือจาก JSON:
{
  "title": "ชื่อแผนท่องเที่ยวที่น่าสนใจดึงดูดใจเป็นภาษาไทย เช่น ทริปตะลุยอารยธรรมและ OTOP เมืองรองพิชัย",
  "summary": "บทสรุปภาพรวมแผนเที่ยวเป็นภาษาไทยสั้นๆ 1-2 ประโยค",
  "duration": "${duration}",
  "pace": "${pace}",
  "interests": ${JSON.stringify(interests)},
  "startPoint": "${startPoint || ""}",
  "stops": [
    {
      "id": "ไอดีสุ่มที่ไม่ซ้ำ เช่น 1-wat_mahathat",
      "placeId": "ไอดีสถานที่จริง เช่น wat_mahathat",
      "name": "ชื่อสถานที่จริง",
      "category": "หมวดหมู่สถานที่",
      "description": "คำอธิบายย่อสถานที่",
      "imageUrl": "URL รูปภาพของสถานที่จริง",
      "latitude": 17.xxxx,
      "longitude": 100.xxxx,
      "timeLabel": "เวลา เช่น 09:00 น.",
      "durationLabel": "ช่วงเวลา เช่น 1 ชั่วโมง",
      "note": "เหตุผลที่แนะนำจุดเช็คอินนี้ให้สอดคล้องกับความสนใจทางวัฒนธรรมและรูปแบบทริปที่เลือก"
    }
  ],
  "tips": [
    "คำแนะนำและข้อพิจารณาความปลอดภัย ทิปท่องเที่ยวท้องถิ่น 3-4 ข้อ"
  ]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const replyText = response.text;
      if (!replyText) {
        throw new Error("No response text from Gemini API");
      }

      const result = JSON.parse(replyText.trim());
      res.json({ result });
    } catch (error) {
      console.error("Trip planner generation error:", error);
      res.status(500).json({ error: "Failed to generate trip plan" });
    }
  });

  // Google Maps Platform Weather API Proxy Endpoint
  app.get("/api/weather/home", async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_WEATHER_API_KEY;

      const latitude = Number(process.env.HOME_WEATHER_LAT || process.env.VITE_HOME_WEATHER_LAT || "17.2877");
      const longitude = Number(process.env.HOME_WEATHER_LNG || process.env.VITE_HOME_WEATHER_LNG || "100.0869");
      const locationName = process.env.HOME_WEATHER_LOCATION_NAME || process.env.VITE_HOME_WEATHER_LOCATION_NAME || "อำเภอพิชัย";

      if (!apiKey) {
        return res.status(500).json({
          error: "GOOGLE_WEATHER_API_KEY is not configured"
        });
      }

      const currentUrl = new URL("https://weather.googleapis.com/v1/currentConditions:lookup");
      currentUrl.searchParams.set("key", apiKey);
      currentUrl.searchParams.set("location.latitude", String(latitude));
      currentUrl.searchParams.set("location.longitude", String(longitude));
      currentUrl.searchParams.set("unitsSystem", "METRIC");
      currentUrl.searchParams.set("languageCode", "th");

      const hourlyUrl = new URL("https://weather.googleapis.com/v1/forecast/hours:lookup");
      hourlyUrl.searchParams.set("key", apiKey);
      hourlyUrl.searchParams.set("location.latitude", String(latitude));
      hourlyUrl.searchParams.set("location.longitude", String(longitude));
      hourlyUrl.searchParams.set("unitsSystem", "METRIC");
      hourlyUrl.searchParams.set("languageCode", "th");
      hourlyUrl.searchParams.set("hours", "8");
      hourlyUrl.searchParams.set("pageSize", "8");

      const [currentResponse, hourlyResponse] = await Promise.all([
        fetch(currentUrl.toString(), {
          headers: { Accept: "application/json" }
        }),
        fetch(hourlyUrl.toString(), {
          headers: { Accept: "application/json" }
        })
      ]);

      if (!currentResponse.ok) {
        return res.status(currentResponse.status).json({
          error: "Google current weather API failed",
          status: currentResponse.status
        });
      }

      const current = await currentResponse.json();

      let hourly = null;

      if (hourlyResponse.ok) {
        hourly = await hourlyResponse.json();
      } else {
        console.warn("Google hourly weather API failed", hourlyResponse.status);
      }

      res.json({
        source: "Google Weather",
        locationName,
        latitude,
        longitude,
        current,
        hourly
      });
    } catch (error) {
      console.error("Home weather error:", error);
      res.status(500).json({
        error: "Failed to fetch Google weather"
      });
    }
  });

  // Vite integration middleware (development) or static assets serving (production)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // index.html must never be cached (it references hashed assets), while the
    // hashed asset files themselves are immutable and can be cached forever.
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Fatal error starting the server:", error);
});
