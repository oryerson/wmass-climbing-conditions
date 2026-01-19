import { Sendometer } from './Sendometer';

export function CragDetail({ crag, onBack }) {
    if (!crag) return <div>loading...</div>;

    // Filter to future only
    const futurePredictions = crag.predictions.filter(p => new Date(p.time) > new Date());

    // Group by Day
    const days = {};
    futurePredictions.forEach(p => {
        const d = new Date(p.time).toLocaleDateString();
        if (!days[d]) days[d] = [];
        days[d].push(p);
    });

    return (
        <div>
            <div className="breadcrumb">
                <span onClick={onBack} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>&lt; return to list</span>
            </div>

            <h2>{crag.name} ({crag.rockType})</h2>
            <p>
                <strong>Location:</strong> {crag.lat}, {crag.lon}<br />
                <strong>Aspect:</strong> {crag.aspect}<br />
                <strong>Status:</strong> <span className={crag.current.status.includes('SOAKED') || crag.current.status.includes('DAMP') || crag.current.status.includes('SNOWY') ? 'wet-text' : 'good-text'}>{crag.current.status}</span>
            </p>

            <Sendometer score={crag.current.score} isWet={crag.current.waterLevel > 0} />

            {Object.keys(days).slice(0, 3).map(dateStr => (
                <div key={dateStr}>
                    <h3>{new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Temp</th>
                                <th>RH</th>
                                <th>Rain?</th>
                                <th>Wind</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {days[dateStr]
                                .filter(p => {
                                    const h = new Date(p.time).getHours();
                                    return [9, 12, 15, 18].includes(h);
                                })
                                .map((p, idx) => (
                                    <tr key={idx} style={{ backgroundColor: p.waterLevel > 0 ? '#e6f3ff' : 'white' }}>
                                        <td>{new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>{p.waterLevel > 0 ? '-' : p.score}</td>
                                        <td>{p.status}</td>
                                        <td>{p.details.temp}°F</td>
                                        <td>{p.details.humidity}%</td>
                                        <td>{p.details.precip > 0 ? `${p.details.precipInch}"` : '-'}</td>
                                        <td>{p.details.windSpeed}mph</td>
                                        <td style={{ fontSize: '11px' }}>
                                            {p.details.snowPack > 0 ? `❄️ Snow: ${p.details.snowInch}"` : (
                                                p.waterLevel > 0 ? `Wet: ${p.waterLevel}mm` : `Hum: ${p.details.humidity}%`
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}
