window.SEED = {
  suburbs: [
    { id: "freo", name: "Fremantle", lat: -32.0569, lng: 115.7439 },
    { id: "south", name: "South Fremantle", lat: -32.0702, lng: 115.7544 },
    { id: "cottesloe", name: "Cottesloe", lat: -31.994, lng: 115.751 },
    { id: "perth", name: "Perth CBD", lat: -31.9523, lng: 115.8613 },
    { id: "subiaco", name: "Subiaco", lat: -31.948, lng: 115.824 },
    { id: "joondalup", name: "Joondalup", lat: -31.745, lng: 115.766 },
    { id: "mandurah", name: "Mandurah", lat: -32.536, lng: 115.742 }
  ],
  sports: ["AFL", "NRL", "Cricket", "NFL", "NBA", "A-League"],
  clubs: {
    AFL: ["Dockers", "Eagles", "Cats", "Lions", "Crows", "Neutral"],
    NRL: ["Storm", "Panthers", "Broncos", "Neutral"],
    Cricket: ["Scorchers", "Sixers", "Heat", "Neutral"],
    NFL: ["49ers", "Chiefs", "Neutral"],
    NBA: ["Lakers", "Celtics", "Neutral"],
    "A-League": ["Glory", "Victory", "Neutral"]
  },
  fixtures: [
    { id: "f1", sport: "AFL", home: "Fremantle", away: "Geelong", label: "Dockers vs Cats", venue: "Optus Stadium", start: "Tonight 6:10pm AWST" },
    { id: "f2", sport: "NRL", home: "Panthers", away: "Roosters", label: "Panthers vs Roosters", venue: "CommBank", start: "Sunday 2:05pm AWST" },
    { id: "f3", sport: "Cricket", home: "Australia", away: "South Africa", label: "Aus vs SA ODI", venue: "Away", start: "Tonight late" },
    { id: "f4", sport: "NFL", home: "49ers", away: "Rams", label: "49ers vs Rams", venue: "US / replay pubs", start: "Monday 10:00am AWST" }
  ],
  venues: [
    { id: "v1", name: "The Freo Hotel", suburb: "freo", lat: -32.055, lng: 115.748, showing: ["f1", "f4"], deal: "Platter after 4 check-ins · jug every 3", seats: 8, pin: "4821" },
    { id: "v2", name: "Local", suburb: "south", lat: -32.068, lng: 115.752, showing: ["f1"], deal: "Jug every 3 check-ins", seats: 6, pin: "4821" },
    { id: "v3", name: "Club", suburb: "cottesloe", lat: -31.996, lng: 115.755, showing: ["f1", "f2"], deal: "Seats held near the screen", seats: 10, pin: "4821" },
    { id: "v4", name: "North End Arms", suburb: "joondalup", lat: -31.744, lng: 115.768, showing: ["f2", "f4"], deal: "Breakfast NFL + held table", seats: 12, pin: "4821" }
  ],
  people: [
    { id: "u1", name: "Dave", suburb: "freo", sports: ["AFL", "NFL"], clubs: { AFL: "Dockers", NFL: "49ers" }, plus: true, ageBand: "30-44", showUp: [11, 12] },
    { id: "u2", name: "Sarah", suburb: "south", sports: ["AFL"], clubs: { AFL: "Cats" }, plus: false, ageBand: "30-44", showUp: [6, 7] },
    { id: "u3", name: "Mick", suburb: "cottesloe", sports: ["AFL", "Cricket"], clubs: { AFL: "Dockers", Cricket: "Scorchers" }, plus: true, ageBand: "45+", showUp: [20, 21] },
    { id: "u4", name: "Jess", suburb: "perth", sports: ["AFL", "NRL"], clubs: { AFL: "Eagles", NRL: "Storm" }, plus: false, ageBand: "18-29", showUp: [3, 4] },
    { id: "u5", name: "Tom", suburb: "joondalup", sports: ["NFL", "AFL"], clubs: { AFL: "Dockers", NFL: "49ers" }, plus: true, ageBand: "30-44", showUp: [8, 9] }
  ]
};
