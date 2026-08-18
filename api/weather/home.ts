import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.GOOGLE_WEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GOOGLE_WEATHER_API_KEY is not configured"
      });
    }

    const lat = Number(
      process.env.HOME_WEATHER_LAT ||
        process.env.VITE_HOME_WEATHER_LAT ||
        "17.2877"
    );

    const lng = Number(
      process.env.HOME_WEATHER_LNG ||
        process.env.VITE_HOME_WEATHER_LNG ||
        "100.0869"
    );

    const locationName =
      process.env.HOME_WEATHER_LOCATION_NAME ||
      process.env.VITE_HOME_WEATHER_LOCATION_NAME ||
      "อำเภอพิชัย";

    const currentUrl =
      `https://weather.googleapis.com/v1/currentConditions:lookup` +
      `?key=${encodeURIComponent(apiKey)}` +
      `&location.latitude=${encodeURIComponent(String(lat))}` +
      `&location.longitude=${encodeURIComponent(String(lng))}` +
      `&unitsSystem=METRIC` +
      `&languageCode=th`;

    const hourlyUrl =
      `https://weather.googleapis.com/v1/forecast/hours:lookup` +
      `?key=${encodeURIComponent(apiKey)}` +
      `&location.latitude=${encodeURIComponent(String(lat))}` +
      `&location.longitude=${encodeURIComponent(String(lng))}` +
      `&unitsSystem=METRIC` +
      `&languageCode=th` +
      `&hours=8` +
      `&pageSize=8`;

    const [currentResponse, hourlyResponse] = await Promise.all([
      fetch(currentUrl),
      fetch(hourlyUrl)
    ]);

    if (!currentResponse.ok) {
      const details = await currentResponse.text();

      return res.status(currentResponse.status).json({
        error: "Google current weather request failed",
        details
      });
    }

    if (!hourlyResponse.ok) {
      const details = await hourlyResponse.text();

      return res.status(hourlyResponse.status).json({
        error: "Google hourly weather request failed",
        details
      });
    }

    const current = await currentResponse.json();
    const hourly = await hourlyResponse.json();

    return res.status(200).json({
      source: "Google Weather",
      locationName,
      latitude: lat,
      longitude: lng,
      current,
      hourly
    });
  } catch (error) {
    console.error("Vercel weather API error:", error);

    return res.status(500).json({
      error: "Failed to load weather data"
    });
  }
}
