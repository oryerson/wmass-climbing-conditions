import { useState, useEffect } from 'react';
import { CRAGS } from './data/crags';
import { getCragWeather } from './services/weather';
import { calculateClimbingConditions } from './utils/dryingAlgorithm';
import { Dashboard } from './components/Dashboard';
import { CragDetail } from './components/CragDetail';
import { Methodology } from './components/Methodology';
import './index.css';

function App() {
    const [cragData, setCragData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list', 'detail', 'methodology'
    const [selectedCrag, setSelectedCrag] = useState(null);

    useEffect(() => {
        async function loadAllCrags() {
            const results = [];
            for (const crag of CRAGS) {
                const weather = await getCragWeather(crag.lat, crag.lon);
                if (weather) {
                    const predictions = calculateClimbingConditions(weather, crag);
                    results.push({ ...crag, predictions: predictions, current: predictions.find(p => p.time > new Date().toISOString()) || predictions[predictions.length - 1] });
                }
            }
            setCragData(results);
            setLoading(false);
        }
        loadAllCrags();
    }, []);

    const handleCreatePost = () => {
        // Just a dummy function for valid craigslist vibe
        alert("post creation disabled for user.");
    };

    return (
        <div className="app-container">
            <div className="nav-bar">
                <a onClick={() => { setView('list'); setSelectedCrag(null); }}>western mass climbing</a>
                <span className="nav-separator">|</span>
                <a onClick={() => setView('methodology')}>methodology</a>
            </div>

            <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                western mass climbing conditions
            </h1>

            {loading ? (
                <div>loading data...</div>
            ) : (
                <>
                    {view === 'list' && (
                        <Dashboard
                            crags={cragData}
                            onViewCrag={(crag) => { setSelectedCrag(crag); setView('detail'); }}
                        />
                    )}

                    {view === 'detail' && selectedCrag && (
                        <CragDetail
                            crag={selectedCrag}
                            onBack={() => { setView('list'); setSelectedCrag(null); }}
                        />
                    )}

                    {view === 'methodology' && (
                        <Methodology
                            onBack={() => { setView('list'); setSelectedCrag(null); }}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default App;
