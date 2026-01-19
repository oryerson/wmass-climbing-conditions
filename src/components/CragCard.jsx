import { ConditionBadge } from './ConditionBadge';

export function CragCard({ crag }) {
    const { name, rockType, aspect, current, predictions } = crag;

    // Find "Best upcoming window" (next 24h)
    const upcomingBest = predictions
        .filter(p => new Date(p.time) > new Date() && new Date(p.time) < new Date(Date.now() + 86400000))
        .sort((a, b) => b.score - a.score)[0];

    return (
        <div className="glass-panel" style={{
            padding: '1.5rem',
            borderRadius: '16px',
            background: 'var(--card-bg, #2a2a2a)',
            border: '1px solid #3a3a3a',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{name}</h2>
                    <div style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '4px' }}>
                        {rockType} • {aspect} Aspect
                    </div>
                </div>
                <ConditionBadge status={current.status} score={current.score} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <div style={{ flex: 1, background: '#333', padding: '0.8rem', borderRadius: '8px' }}>
                    <div style={{ opacity: 0.6, marginBottom: '4px' }}>Current</div>
                    <div>Temp: {current.details.temp}°C</div>
                    <div>Humidity: {current.details.humidity}%</div>
                    <div>Wind: {current.details.windSpeed} km/h</div>
                    {current.waterLevel > 0 && <div style={{ color: '#60a5fa', marginTop: '4px' }}>💧 Wetness: {current.waterLevel}mm</div>}
                </div>
            </div>

            {upcomingBest && upcomingBest.score > current.score && (
                <div style={{
                    fontSize: '0.85rem',
                    color: '#4ade80',
                    background: 'rgba(74, 222, 128, 0.1)',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    textAlign: 'center'
                }}>
                    💡 Best Window: {new Date(upcomingBest.time).toLocaleTimeString([], { weekday: 'short', hour: '2-digit' })} (Score: {upcomingBest.score})
                </div>
            )}
        </div>
    );
}
