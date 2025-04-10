import reverse_geocoder as rg

def handle_package(data):
    coords = (data['lat'], data['lon'])
    location = rg.search(coords)[0]  # returns a dict
    data['country'] = location['cc']  # Country code like 'US', 'RU', etc.
    print("Received from", data['country'])
