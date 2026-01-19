export function ConditionBadge({ status, score }) {
    let color = '#9ca3af'; // gray
    if (status === 'PRIME') color = '#ec4899'; // Pink
    else if (status === 'GOOD') color = '#22c55e'; // Green
    else if (status === 'OKAY') color = '#eab308'; // Yellow
    else if (status === 'DAMP') color = '#3b82f6'; // Blue
    else if (status === 'SOAKED') color = '#ef4444'; // Red

    return (
        <div style={{
            background: color,
            color: status === 'PRIME' || status === 'SOAKED' ? 'white' : 'black',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            boxShadow: `0 0 10px ${color}66`
        }}>
            {status} ({score})
        </div>
    );
}
