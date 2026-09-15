import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Snowflake } from "lucide-react";

async function getCoordinates(city: string) {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;
    return {
      lat: data.results[0].latitude,
      lon: data.results[0].longitude,
      name: data.results[0].name
    };
  } catch (error) {
    console.error("Failed to fetch coordinates:", error);
    return null;
  }
}

async function getWeather(lat: number, lon: number) {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.current_weather;
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return null;
  }
}

export default async function WeatherWidget({ city }: { city: string }) {
  const coords = await getCoordinates(city);
  let weather = null;
  
  if (coords) {
    weather = await getWeather(coords.lat, coords.lon);
  }

  // Map WMO weather codes to icons
  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="h-6 w-6 text-yellow-500" />;
    if (code <= 3) return <Cloud className="h-6 w-6 text-gray-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="h-6 w-6 text-blue-400" />;
    if (code >= 71 && code <= 77) return <Snowflake className="h-6 w-6 text-blue-200" />;
    return <Cloud className="h-6 w-6 text-gray-400" />;
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <span>Weather • {coords?.name || city}</span>
          {weather && getWeatherIcon(weather.weathercode)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {weather ? (
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold">{Math.round(weather.temperature)}°</span>
            <span className="text-sm text-gray-500">C</span>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Weather data unavailable</div>
        )}
      </CardContent>
    </Card>
  );
}
