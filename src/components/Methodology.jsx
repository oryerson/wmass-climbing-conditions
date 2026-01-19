export function Methodology({ onBack }) {
    return (
        <div style={{ maxWidth: '800px' }}>
            <div className="breadcrumb">
                <a onClick={onBack}>&lt; return to main page</a>
            </div>

            <h1>Methodology & Algorithms</h1>

            <div style={{
                border: '1px solid #ccc',
                padding: '10px',
                marginBottom: '20px',
                fontSize: '14px',
                backgroundColor: '#fafafa',
            }}>
                <h3>Condition Key</h3>
                <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
                    <li><span className="good-text">PRIME</span>: Dry, Crisp Friction (Low Humidity / Good Temps).</li>
                    <li><span className="good-text">GOOD</span>: Dry, Decent Friction.</li>
                    <li><strong>OKAY</strong>: Dry, but maybe too hot, too cold, or humid.</li>
                    <li><span className="wet-text">DAMP</span>: Risk of wet holds. Drying in progress.</li>
                    <li><span className="wet-text">SOAKED</span>: Actively raining or saturated rock. Do not climb.</li>
                    <li><strong>SNOWY</strong>: Significant snow accumulation on ground/ledges.</li>
                </ul>
            </div>

            <p>
                This predictor uses a <strong>Runoff-Decay Model</strong> (v3.0) to estimate rock wetness.
                Our model accounts for <em>saturation run-off</em> (gravity), <em>exponential drying</em>, and <em>snow melt</em>.
            </p>

            <h2>1. Snow & Melt Logic</h2>
            <p>
                Unlike rain, snow doesn't run off immediately. It accumulates as <code>SnowPack</code>.
                <br /><strong>Melting</strong>: When Temp &gt; 32°F (0°C), the snow melts into the rock's water saturation.
                <br /><em>Impact</em>: A sunny, warm day after a snowstorm might be <strong>wet</strong> because of active melting, whereas a cloudy freezing day might keep the rock dry (but frozen).
            </p>

            <h2>2. The Runoff-Decay Equation</h2>
            <p>
                We track the <code>WaterLevel</code> (in mm) on the rock surface hour-by-hour.
                The state at hour <em>t+1</em> is calculated as:
            </p>
            <div className="math-block">
                W(t+1) = [ W(t) + Precip(t) + Melt(t) ] * (1 - k_drying)
            </div>
            <p>
                Where:
                <br />• <strong>W(t)</strong> is the water separation (capped at 5.0mm to simulate runoff).
                <br />• <strong>Precip(t)</strong> is the rainfall in that hour.
                <br />• <strong>k_drying</strong> is the Drying Coefficient (0.0 to 1.0).
            </p>

            <h2>3. The Drying Coefficient (k)</h2>
            <p>
                The rate at which rock dries is not constant. It is driven by Phase Change (Evaporation).
                We calculate <code>k_drying</code> dynamically each hour:
            </p>
            <div className="math-block">
                k_drying = k_base + k_wind + k_sun * f_humidity
            </div>
            <ul>
                <li><strong>k_base (0.02)</strong>: Minimal ambient evaporation.</li>
                <li><strong>k_wind</strong>: <code>WindSpeed (mph) * 0.008</code> (approx). Wind strips the saturated boundary layer of air, dramatically accelerating drying.</li>
                <li><strong>k_sun</strong>: <code>0.08</code> if sunny.
                    <br /><em>Aspect Multiplier</em>: If the crag faces the sun at that hour (e.g., South face at Noon), this bonus doubles.
                </li>
                <li><strong>Bouldering Penalty</strong>: Boulders (like GB or Hideaway) sit low to the damp ground and are often shielded from wind by trees. We apply a <strong>30% drying penalty</strong> to all bouldering areas to account for this microclimate.</li>
            </ul>

            <h2>4. Dew Point Penalty</h2>
            <p>
                Relative Humidity (RH) is deceptive. 90% RH at 5°C is very different from 90% RH at 30°C.
                Instead, we use the <strong>Dew Point Spread</strong>:
            </p>
            <div className="math-block">
                Spread = Temperature - DewPoint
            </div>
            <p>
                If <code>Spread &lt; 2°C</code>, the air is effectively saturated. Condensation may occur on cold rock.
                In this case, <code>f_humidity</code> becomes <strong>0.1</strong>, effectively halting drying.
            </p>

            <h2>5. Condition Scoring</h2>
            <p>
                If the rock is dry (WaterLevel = 0), we score conditions (0-100) based on Friction and Comfort.
            </p>
            <div className="math-block">
                Score = (0.6 * Friction) + (0.4 * Comfort)
            </div>
            <p>
                <strong>Friction</strong> is derived from the Dew Point Spread (crisp air = high friction).<br />
                <strong>Comfort</strong> follows a bell curve centered on 10°C (50°F), highlighting prime crisp conditions.<br />
            </p>
        </div>
    );
}
