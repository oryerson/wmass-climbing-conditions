export function Dashboard({ crags, onViewCrag }) {
    // Helper to get daily summary
    const getDailyPreviews = (predictions) => {
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);

        const getDayStats = (dateTarget) => {
            const dateStr = dateTarget.toLocaleDateString();
            const dailyPreds = predictions.filter(p => new Date(p.time).toLocaleDateString() === dateStr);

            if (dailyPreds.length === 0) return null;

            let wet = false;
            let maxScore = -1;
            let bestStatus = 'POOR';

            dailyPreds.forEach(p => {
                if (p.waterLevel > 0) wet = true;
                if (p.score > maxScore) {
                    maxScore = p.score;
                    bestStatus = p.status;
                }
            });

            return { wet, status: bestStatus };
        };

        return [
            { label: 'Today', stats: getDayStats(today) },
            { label: 'Tomorrow', stats: getDayStats(tomorrow) },
            { label: dayAfter.toLocaleDateString(undefined, { weekday: 'long' }), stats: getDayStats(dayAfter) }
        ];
    };

    const getStatusColor = (status, wet) => {
        if (!status) return 'gray'; // No data
        if (status === 'SNOWY') return 'wet-text';
        if (wet) return 'wet-text';
        if (status === 'PRIME') return 'good-text';
        if (status === 'GOOD') return 'good-text';
        if (status === 'OKAY' || status === 'POOR') return 'okay-text';
        return '';
    };

    return (
        <div>
            <p>select a location below to see full details:</p>
            <ul>
                {crags.map(crag => {
                    const previews = getDailyPreviews(crag.predictions);
                    return (
                        <li key={crag.id} style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                <a onClick={() => onViewCrag(crag)} style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                    {crag.name}
                                </a>
                                <span style={{ fontSize: '12px', color: '#666' }}>
                                    ({crag.rockType} - {crag.aspect} facing)
                                </span>
                            </div>

                            {/* 3-Day Preview Thumbnail */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                {previews.map((day, idx) => (
                                    <div key={idx} style={{
                                        border: '1px solid #ddd',
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        minWidth: '60px',
                                        textAlign: 'center',
                                        backgroundColor: day.stats && (day.stats.status === 'SNOWY') ? '#f0f8ff' : (
                                            day.stats && day.stats.wet ? '#fff0f0' : (
                                                day.stats && (day.stats.status === 'POOR' || day.stats.status === 'OKAY') ? '#fffff0' : '#f0fff0'
                                            )
                                        )
                                    }}>
                                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', marginBottom: '2px' }}>{day.label}</div>
                                        <div className={day.stats ? getStatusColor(day.stats.status, day.stats.wet) : ''}>
                                            {day.stats ? (
                                                day.stats.status === 'SNOWY' ? 'SNOWY' :
                                                    (day.stats.wet ? (day.stats.status === 'SOAKED' ? 'SOAKED' : 'DAMP') : day.stats.status)
                                            ) : '-'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
