export async function getCragWeather(lat, lon) {
    // We need PAST days to know if the rock is already wet!
    // Open-Meteo allows `past_days=2`
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,dewpoint_2m,precipitation,rain,showers,snowfall,cloudcover,windspeed_10m,winddirection_10m&past_days=2&forecast_days=3`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather fetch failed');
        const data = await response.json();
        return data; // Returns the full object with hourly arrays
    } catch (error) {
        console.error("API Error", error);
        return null;
    }
}
