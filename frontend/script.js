let globeInstance;
let allPoints = [];
let fetchInterval = 1000;
let fetchTimer = null;
let virtualTime = new Date();
let clockTimer = null;
let fetchStopTimer = null;
let isSimulationRunning = true;

init();
startFetching();
startClock();

function init() {
    const tooltip = document.getElementById('tooltip');

    globeInstance = Globe()
        (document.getElementById('globeViz'))
        .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')
        .backgroundImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png')
        .pointLat('lat')
        .pointLng('lon')
        .pointAltitude(0.01)
        .pointColor(p => p.suspicious ? 'red' : 'white')
        .pointRadius(0.4)
        .pointsMerge(true)
        .showAtmosphere(true)
        .atmosphereColor('#3a228a')
        .atmosphereAltitude(0.1)
        .pointLabel(p => `IP: ${p.ip}<br/>Suspicious: ${p.suspicious ? '✅' : '❌'}`);

    document.getElementById("suspicious-toggle").addEventListener("change", updatePoints);

    document.getElementById("speed-range").addEventListener("input", (e) => {
        fetchInterval = +e.target.value;
        document.getElementById("speed-display").innerText = `x${(1000 / fetchInterval).toFixed(1)}`;
        if (isSimulationRunning) {
            restartFetching();
            restartClock();
        }
    });

    document.getElementById("stop-button").addEventListener("click", () => {
        const btn = document.getElementById("stop-button");
    
        if (isSimulationRunning) {
            clearInterval(fetchTimer);
            clearInterval(clockTimer);
            clearTimeout(fetchStopTimer);
            document.getElementById("clock").textContent = "🛑 Simulation Stopped";
            console.log("🛑 Simulation manually stopped.");
    
            // 💥 Show the plot popup when stopped manually
            document.getElementById("plot-popup").style.display = "flex";
    
            btn.textContent = "▶ Run Simulation";
        } else {
            console.log("▶ Simulation resumed.");
            btn.textContent = "⏹ Stop Simulation";
            startFetching();
            startClock();
        }
    
        isSimulationRunning = !isSimulationRunning;
    });    

    document.getElementById("close-popup").addEventListener("click", () => {
        document.getElementById("plot-popup").style.display = "none";
    });
}

function startFetching() {
    fetchData();
    fetchTimer = setInterval(fetchData, fetchInterval);

    fetchStopTimer = setTimeout(() => {
        clearInterval(fetchTimer);
        console.log("⏱️ Packet fetching stopped after 2 minutes.");
        document.getElementById("plot-popup").style.display = "flex";
    }, 2 * 60 * 1000);
}

function restartFetching() {
    clearInterval(fetchTimer);
    clearTimeout(fetchStopTimer);
    startFetching();
}

function startClock() {
    clockTimer = setInterval(() => {
        virtualTime = new Date(virtualTime.getTime() + (1000 * (1000 / fetchInterval)));
        document.getElementById("clock").textContent = `🕒 ${virtualTime.toLocaleString()}`;
    }, 1000);
}

function restartClock() {
    clearInterval(clockTimer);
    startClock();
}

async function fetchData() {
    try {
        const res = await fetch("http://127.0.0.1:5000/data");
        const points = await res.json();

        const cleaned = points
            .map(p => ({
                ip: p.ip || 'unknown',
                lat: parseFloat(p.lat),
                lon: parseFloat(p.lon || p.lng || p.log),
                suspicious: !!p.suspicious,
                timestamp: virtualTime.getTime()
            }))
            .filter(p => !isNaN(p.lat) && !isNaN(p.lon));

        allPoints.push(...cleaned);
        updatePoints();

        const resTop = await fetch("http://127.0.0.1:5000/top_countries");
        const top = await resTop.json();

        const list = document.getElementById("country-list");
        list.innerHTML = '';
        top.forEach(([country, count]) => {
            const li = document.createElement("li");
            li.textContent = `${country}: ${count}`;
            list.appendChild(li);
        });

    } catch (err) {
        console.error("Failed to fetch data:", err);
    }
}

function updatePoints() {
    const suspiciousOnly = document.getElementById("suspicious-toggle").checked;
    const visible = suspiciousOnly ? allPoints.filter(p => p.suspicious) : allPoints;
    globeInstance.pointsData(visible);
}
