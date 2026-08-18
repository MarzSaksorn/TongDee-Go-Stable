export interface HomeHourlyWeather {
  timeLabel: string;
  temperature?: number | null;
  condition?: string | null;
  rainChance?: number | null;
  iconBaseUri?: string | null;
}

export interface HomeWeatherData {
  source: "Google Weather" | "fallback";
  locationName: string;
  temperature?: number | null;
  feelsLike?: number | null;
  condition?: string | null;
  humidity?: number | null;
  rainChance?: number | null;
  windSpeed?: number | null;
  uvIndex?: number | null;
  iconBaseUri?: string | null;
  updatedAt?: string | null;
  hourly: HomeHourlyWeather[];
}

function formatHour(hour?: number | null) {
  if (typeof hour !== "number") return "-";
  return `${String(hour).padStart(2, "0")}:00`;
}

function normalizeGoogleWeather(data: any): HomeWeatherData {
  const current = data.current;
  const currentCondition = current?.weatherCondition;

  const hourly =
    data.hourly?.forecastHours?.map((item: any) => ({
      timeLabel: formatHour(item?.displayDateTime?.hours),
      temperature: item?.temperature?.degrees ?? null,
      condition: item?.weatherCondition?.description?.text ?? null,
      rainChance: item?.precipitation?.probability?.percent ?? null,
      iconBaseUri: item?.weatherCondition?.iconBaseUri ?? null
    })) ?? [];

  return {
    source: "Google Weather",
    locationName: data.locationName || "อำเภอพิชัย",
    temperature: current?.temperature?.degrees ?? null,
    feelsLike: current?.feelsLikeTemperature?.degrees ?? null,
    condition: currentCondition?.description?.text ?? null,
    humidity: current?.relativeHumidity ?? null,
    rainChance: current?.precipitation?.probability?.percent ?? null,
    windSpeed: current?.wind?.speed?.value ?? null,
    uvIndex: current?.uvIndex ?? null,
    iconBaseUri: currentCondition?.iconBaseUri ?? null,
    updatedAt: current?.currentTime ?? null,
    hourly
  };
}

export async function getHomeWeather(): Promise<HomeWeatherData> {
  let response: Response;
  try {
    response = await fetch("/api/weather/home");
  } catch (err) {
    console.error("Weather request failed:", err);
    throw err;
  }

  if (!response.ok) {
    const err = new Error(`Weather API failed with ${response.status}`);
    console.error("Weather request failed:", err);
    throw err;
  }

  const data = await response.json();
  return normalizeGoogleWeather(data);
}
