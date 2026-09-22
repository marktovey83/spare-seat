# Spare Seat

Don't watch it alone.

Demo web app for the Spare Seat product: tonight's fixtures, pub pins, held seats, check-in, shared table deals, ratings, Plus, venue door list, and an **admin** view of each area.

This is a front-end prototype with seeded Perth data stored in the browser (`localStorage`). It is not a licensed bookmaker and does not take stakes, wallets, or payouts.

## Run it

Open `index.html` in a browser, or from this folder:

```bash
python3 -m http.server 5173
```

Then visit http://localhost:5173

## Demo logins

| Role | How to sign in |
|---|---|
| Punter | Pick **I'm watching**, any nickname. Try `Dave` (Dockers, Fremantle). |
| Venue | **I'm a venue** → Freo Hotel / Local / Club. PIN `4821` |
| Admin | **Admin** → user `admin` / password `spareseat` |

Change the admin password in `js/app.js` (`ADMIN`) before any real use.

## What works in this demo

- Tonight fixtures (AFL, NRL, cricket, NFL sample)
- 10 km free radius vs Plus (anywhere + filters + friends + full table list)
- I'm heading here / I'm here (geofence mocked from your chosen suburb)
- Venue door list, held seats, jug every 3 check-ins, platter deal
- Match room + pub table chat
- Plus friends and crew chat
- Rate venue
- Admin: users by suburb, venues, live headcounts, check-ins, reports

## Not in v1 (on purpose)

- Real maps API billing
- Real GPS (demo uses suburb coordinates)
- Payments / App Store IAP
- Betting, stakes, PayID settlement
