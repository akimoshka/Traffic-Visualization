import pandas as pd
import requests
import time
from datetime import datetime

speed_multiplier = 0.5

df = pd.read_csv("ip_addresses.csv")
df['Timestamp'] = pd.to_datetime(df['Timestamp'], unit='s')
df = df.sort_values(by='Timestamp').reset_index(drop=True)

for i in range(len(df)):
    row = df.loc[i]

    packet = {
        "ip": row['ip address'],
        "lat": row['Latitude'],
        "lon": row['Longitude'],
        "timestamp": row['Timestamp'].isoformat(),
        "suspicious": row['suspicious']
    }

    try:
        # response = requests.get("http://127.0.0.1:5000/receive", json=packet)
        response = requests.get("http://backend:5000/receive", json=packet)
        print("Sent:", packet, "Response:", response.status_code)
    except Exception as e:
        print("Failed to send:", e)

    # Delay (accelerated by speed_multiplier)
    if i < len(df) - 1:
        real_delay = (df.loc[i + 1, 'Timestamp'] - row['Timestamp']).total_seconds()
        time.sleep(min(real_delay * speed_multiplier, 2))  # cap to avoid long waits
