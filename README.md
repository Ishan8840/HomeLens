## Demo

[![HomeLens Demo](https://youtu.be/neJlE-4Xr7w)](https://youtu.be/neJlE-4Xr7w)


## Inspiration
Our inspiration came from noticing how difficult it is to quickly understand the spaces around us. When walking through a neighborhood, we can see buildings everywhere, but learning anything meaningful about them usually requires searching addresses, switching between apps, and manually comparing information. This takes a long time and is very confusing. As a team, we wanted to build something that makes housing and location-based information easier to access and more intuitive, especially for students and first-time renters or buyers.

## What it does
HomeLens is a web-based app that uses a phone’s camera, GPS, and orientation data to identify the building a user is looking at. Once the user remains looking at the same building for two consecutive seconds, a scan button appears. Pressing this button triggers a backend process that identifies the building in front of the user, then returns useful information such as rental estimates, real estate prices, and nearby amenities. Users can scroll through the results and immediately perform another scan if they want to explore more buildings.

## How it works
The frontend is a web app that accesses the phone’s camera, GPS coordinates, and orientation sensors. It continuously monitors motion and only enables scanning when the device is stable to improve accuracy. When the user scans, the frontend sends an API request to our backend hosted on Render.

The backend receives the user’s latitude, longitude, heading, and a fixed search radius of 50 meters. It then queries a Supabase PostgreSQL database containing over 200,000 buildings in Hamilton, each stored with precise centroid coordinates. From the set of buildings within the radius, mathematical calculations using distance and heading are applied to determine which building the user is most likely facing.

Once the most probable building is selected, its coordinates are sent to Nominatim to retrieve a human-readable address and location name. That address is then sent to the Gemini API, which generates contextual information about the building, including rental costs, real estate prices, nearby amenities such as grocery stores, food options, schools, and other information, such as distance to McMaster and nearby bus stops (added after the demo video was taken). The backend aggregates all results and sends them back to the frontend, where the data is parsed and displayed to the user.

## Challenges we ran into
One of the biggest challenges was accurately determining which building a user was looking at, especially in dense areas with many buildings close together. To address sensor noise, slight hand movement, and GPS inaccuracy, we implemented a stability check that requires the phone to remain still for one consecutive second before allowing a scan. We also limited the search space by using a fixed 50-meter radius and combined distance calculations with the phone’s heading to rank nearby buildings by likelihood. This approach significantly reduced false positives and improved the consistency of building selection in real-world conditions.

## Accomplishments that we're proud of
We are proud that we built a fully working end-to-end system that connects real-world sensor data to meaningful building-level information. Accurately narrowing down a single building from tens of nearby candidates was a major technical win. We are also proud of how well the different components work together, from frontend sensors to database queries to external APIs, all within a smooth user flow.

## What we learned
As a team, we learned how to coordinate frontend, backend, and data-heavy components into a single system. Technically, we gained experience working with mobile sensors, geospatial math, large databases, API orchestration, and cloud deployment. We also learned the importance of validating assumptions about real-world data, since sensor readings and geographic data are rarely perfect.

## What's next for HomeLens
Next, we want to improve accuracy by incorporating better sensor filtering and adaptive radius selection. We would also like to expand beyond Hamilton to support more cities and integrate more reliable, real-world data sources for pricing and amenities. Long-term, Homelytics could support saved scans, comparison views, and personalized recommendations based on user preferences.


## Devpost
https://devpost.com/software/homelytics?ref_content=my-projects-tab&ref_feature=my_projects


## Built With
data
fastapi
geminiapi
javascript
nominatim
postgis
postgresql
python
react
render
sql
supabase
vercel

## Try it out
[macathon-beta.vercel.app](https://macathon-beta.vercel.app/)
