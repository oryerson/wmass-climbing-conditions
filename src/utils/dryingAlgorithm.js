/**
 * Calculates the "Climbing Condition Score" and "Wetness Status" for a crag.
 * UPDATED: Uses Runoff-Decay model, Dew Point, and SNOW/MELT logic.
 * 
 * @param {Object} weather - Hourly weather data from Open-Meteo
 * @param {Object} crag - Crag metadata (aspect, name, etc.)
 * @returns {Array} - Hourly forecast objects with score and status
 */
export function calculateClimbingConditions(weather, crag) {
    const hourlyPredictions = [];

    // "Runoff-Decay Model" state
    let waterLevel = 0; // mm of liquid water.
    let snowPack = 0; // mm of frozen water equivalent (snow).

    const SATURATION_CAP = 5.0; // Max liquid water rock can hold

    const totalHours = weather.hourly.time.length;

    for (let i = 0; i < totalHours; i++) {
        const time = weather.hourly.time[i];
        const precip = weather.hourly.precipitation[i]; // mm
        const snowfall = weather.hourly.snowfall[i]; // cm (Open-Meteo usually gives cm for snowfall)
        const rain = weather.hourly.rain[i]; // mm
        const temp = weather.hourly.temperature_2m[i]; // C
        const humidity = weather.hourly.relativehumidity_2m[i]; // %
        const dewPoint = weather.hourly.dewpoint_2m ? weather.hourly.dewpoint_2m[i] : temp - ((100 - humidity) / 5);
        const windSpeed = weather.hourly.windspeed_10m[i]; // km/h
        const cloudCover = weather.hourly.cloudcover[i]; // %

        // 1. SNOW ACCUMULATION
        // Snowfall adds to SnowPack, not WaterLevel (yet).
        // Note: Open-Meteo 'snowfall' is cm. 1cm snow ~= 1mm water equivalent (roughly 10:1 ratio).
        if (snowfall > 0) {
            snowPack += (snowfall * 10); // Convert cm to mm for consistency with rain? 
            // Actually, let's keep snowPack in 'mm of water equivalent'.
            // Standard rule: 10mm snow = 1mm water.
            // Open-Meteo gives snow in cm. 1cm snow = 10mm snow depth ~= 1mm water.
            // But 'precipitation' field in Open-Meteo usually includes the water equivalent of snow.
            // So we don't double count.
            // Logic: If Temp < 0, Precip goes to SnowPack. If Temp > 0, Precip goes to WaterLevel.
        }

        // REFINED PRECIP LOGIC
        // If it's freezing, precip accumulates as snow/ice.
        if (temp < 0 && precip > 0) {
            snowPack += precip; // precip is water-equivalent mm.
        } else if (precip > 0) {
            // It's rain.
            waterLevel += precip;
            if (waterLevel > SATURATION_CAP) waterLevel = SATURATION_CAP;
        }

        // 2. MELT LOGIC
        // SnowPack releases water if Temp > 0.
        // Melt Rate: Approx 0.5mm per hour per Degree C above freezing.
        // Sun dramatically accelerates melt.
        let meltAmount = 0;
        if (temp > 0 && snowPack > 0) {
            let meltRate = 0.2 * temp; // Base thermal melt

            // Sun Aspect Logic
            const date = new Date(time);
            const hour = date.getHours();
            const isDaytime = hour >= 6 && hour <= 19;
            const isSunny = isDaytime && cloudCover < 50;

            let aspectMultiplier = 0.2;
            if (isSunny) {
                if (crag.aspect === 'S' && hour >= 10 && hour <= 14) aspectMultiplier = 1.0;
                else if (crag.aspect === 'SE' && hour >= 8 && hour <= 12) aspectMultiplier = 1.0;
                else if (crag.aspect === 'SW' && hour >= 13 && hour <= 17) aspectMultiplier = 1.0;
                else aspectMultiplier = 0.5;
            }

            if (isSunny) meltRate += (aspectMultiplier * 1.5); // Sun is a laser beam for snow

            meltAmount = Math.min(snowPack, meltRate);
            snowPack -= meltAmount;

            // Meltwater enters the bucket
            waterLevel += meltAmount;
            if (waterLevel > SATURATION_CAP) waterLevel = SATURATION_CAP;
        }

        // 3. DRYING LOGIC (Runoff-Decay)
        let evaporationCoeff = 0.02; // Base decay

        // Wind Bonus
        evaporationCoeff += (windSpeed * 0.005);

        // Sun Bonus (Aspect)
        const date = new Date(time);
        const hour = date.getHours();
        const isDaytime = hour >= 6 && hour <= 19;
        const isSunny = isDaytime && cloudCover < 50;

        // (Re-calc aspect multiplier for drying if not already done for melt)
        let aspectMultiplier = 0.2;
        if (isSunny) {
            if (crag.aspect === 'S' && hour >= 10 && hour <= 14) aspectMultiplier = 1.0;
            else if (crag.aspect === 'SE' && hour >= 8 && hour <= 12) aspectMultiplier = 1.0;
            else if (crag.aspect === 'SW' && hour >= 13 && hour <= 17) aspectMultiplier = 1.0;
            else aspectMultiplier = 0.5;
        }
        evaporationCoeff += (aspectMultiplier * 0.08);

        // Bouldering Penalty
        if (crag.type === 'boulder') {
            if (windSpeed > 10) evaporationCoeff -= (windSpeed * 0.002);
            evaporationCoeff *= 0.7;
        }

        // Dew Point Penalty
        const dewPointSpread = Math.max(0, temp - dewPoint);
        let humidityFactor = 1.0;
        if (dewPointSpread < 1.0) humidityFactor = 0.1;
        else if (dewPointSpread < 3.0) humidityFactor = 0.5;

        evaporationCoeff *= humidityFactor;

        if (evaporationCoeff > 0.5) evaporationCoeff = 0.5;

        // Apply Decay
        waterLevel = waterLevel * (1.0 - evaporationCoeff);
        if (waterLevel < 0.05) waterLevel = 0;

        // 4. DETERMINE SCORE
        let score = 0;
        let status = "WET";

        // Logic check: Is there snow on the ground?
        if (snowPack > 1.0) {
            status = "SNOWY"; // >1mm water equivalent (approx 0.5 inch snow) is enough to ruin the day
            score = 0;
        } else if (waterLevel === 0) {
            status = "DRY";

            // Friction Score
            let frictionScore = (Math.min(15, dewPointSpread) / 15) * 100;
            const tempDist = Math.abs(temp - 10); // 10C ideal

            // Comfort Score (40-60F ideal)
            let comfortScore = 100 - Math.abs(temp - 10) * 4;
            if (windSpeed > 20 && temp < 10) comfortScore -= 20;

            score = (frictionScore * 0.6) + (comfortScore * 0.4);
            score = Math.max(0, Math.min(100, score));

            if (score > 80) status = "PRIME";
            else if (score > 60) status = "GOOD";
            else if (score > 40) status = "OKAY";
            else status = "POOR";
        } else {
            status = waterLevel > 1.5 ? "SOAKED" : "DAMP";
            score = 0;
        }

        // CONVERT TO IMPERIAL
        const tempF = Math.round((temp * 9 / 5) + 32);
        const dewPointF = Math.round((dewPoint * 9 / 5) + 32);
        const windSpeedMph = Math.round(windSpeed * 0.621371);

        // Snow/Melt info for details
        const snowInch = (snowPack / 25.4).toFixed(1);

        hourlyPredictions.push({
            time: time,
            waterLevel: parseFloat(waterLevel.toFixed(2)),
            score: Math.round(score),
            status: status,
            details: {
                temp: tempF,
                humidity,
                dewPoint: dewPointF,
                windSpeed: windSpeedMph,
                precip, // Keep raw mm for debugging/math if needed
                precipInch: (precip / 25.4).toFixed(2),
                snowPack: parseFloat(snowPack.toFixed(1)),
                snowInch: (snowPack / 25.4).toFixed(1),
                melt: parseFloat(meltAmount.toFixed(1)),
                evapCoeff: (evaporationCoeff * 100).toFixed(0) + '%'
            }
        });
    }

    return hourlyPredictions;
}
