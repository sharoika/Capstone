import requests
import polyline  # Install using: pip install polyline

# Google Maps API Key (Replace with your actual API key)
API_KEY = "AIzaSyBkmAjYL9HmHSBtxxI0j3LB1tYEwoCnZXg"

# Start and End Locations
origin = "3130 Woodhams Dr, Regina, SK S4V 2P9"
destination = "376 University Park Dr, Regina, SK S4X 1J4"

# Google Maps Directions API Endpoint
url = "https://maps.googleapis.com/maps/api/directions/json"

# API Request Parameters
params = {
    "origin": origin,
    "destination": destination,
    "key": API_KEY
}

# Send GET Request
response = requests.get(url, params=params)
data = response.json()

if "routes" in data and data["routes"]:
    polyline_encoded = data["routes"][0]["overview_polyline"]["points"]
    route_coordinates = polyline.decode(polyline_encoded)

    # Format coordinates in the required format
    formatted_coordinates = [
        {"lat": lat, "long": lng} for lat, lng in route_coordinates
    ]

    # Print formatted coordinates
    print("[")
    for coord in formatted_coordinates:
        print(f"    {{ lat: {coord['lat']}, long: {coord['long']} }},")
    print("]")
else:
    print("No route found! Check API Key or input addresses.")
