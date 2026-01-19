export function Sendometer({ score, isWet }) {
    // "Send Percentage" Logic
    // If wet: 0%
    // If dry: sigmoid curve based on score?
    // Let's do a fun heuristic mapping.

    let percentage = 0;
    let text = "No chance.";

    if (!isWet) {
        // Map 0-100 score to roughly 0-99% send probability
        // Cap at 99% because nothing is guaranteed in climbing.
        percentage = Math.floor(score * 0.95);
        if (percentage > 99) percentage = 99;

        if (percentage > 90) text = "Send Train Leaving Station! 🚂";
        else if (percentage > 75) text = "High likelihood of crushing.";
        else if (percentage > 50) text = "Possible with good beta.";
        else if (percentage > 25) text = "Conditions are fighting you.";
        else text = "Resume building mode.";
    }

    // Color gradient from red to green
    const color = isWet ? '#ef4444' : `hsl(${percentage * 1.2}, 70%, 45%)`;

    return (
        <div style={{
            border: '2px solid #333',
            padding: '15px',
            textAlign: 'center',
            marginBottom: '20px',
            background: '#fffcd1', // faint yellow note-paper look
            boxShadow: '3px 3px 0px #000'
        }}>
            <h3 style={{ marginTop: 0, borderBottom: 'none' }}>send predictor</h3>
            <div style={{
                fontSize: '42px',
                fontWeight: 'bold',
                color: color,
                margin: '10px 0'
            }}>
                {percentage}%
            </div>
            <div style={{ fontStyle: 'italic', fontSize: '14px' }}>
                "{text}"
            </div>
        </div>
    );
}
