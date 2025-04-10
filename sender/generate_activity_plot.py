import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

# Load and convert timestamps
df = pd.read_csv("ip_addresses.csv")
df['Timestamp'] = pd.to_datetime(df['Timestamp'], unit='s')

# Round to nearest 10-second intervals (or 1 minute, if preferred)
df['time_bin'] = df['Timestamp'].dt.floor('10s')  # or '1min' for minutes

# Count how many packets per bin
counts = df.groupby('time_bin').size()

# Plot
plt.figure(figsize=(10, 5))
counts.plot(kind='bar', color='skyblue')

plt.title("Packet Activity Over Time")
plt.xlabel("Time")
plt.ylabel("Packets Sent")
plt.xticks(rotation=45)
plt.tight_layout()
plt.grid(True, linestyle='--', alpha=0.5)
plt.savefig("../frontend/activity_plot.png")
print("✅ Plot saved as frontend/activity_plot.png")
