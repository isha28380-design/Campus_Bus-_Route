# Campus Bus Route and Timing Portal

A responsive multi-page website that helps new students find campus bus routes, stops and departure times, check whether a bus is running, and plan a trip between two stops.

Built for CSE 326 (CA) using only HTML, CSS and basic JavaScript.

**Live site:** https://isha28380-design.github.io/Campus_Bus-_Route/

## Problem

New students often do not know which campus bus goes where or when it leaves. The details are spread across notice boards, chats and word of mouth, and delays or suspensions are not visible. There is no single place to search stops and compare routes.

## Solution

One website that keeps every route, stop and timing in a searchable directory, shows the status of each route, and lets routes be added, updated or removed through validated forms.

## Features

- **Route directory** with category, status, stops and next departure for every route
- **Search and filters** by route name, code or stop, plus category and status filters
- **Find a bus** to pick a start and an end stop and list the routes that cover the trip, with the next bus time and travel time
- **Route pages** with the full departure list, a stop map (SVG) and notes, with the next bus highlighted
- **Add and update forms** with input validation and clear success and error messages
- **Status tracking** (Running, Delayed, Suspended) that can be changed from a table
- **Summary view** on the home page with route, stop and status counts and a next departures table, all calculated from the stored data
- **Responsive layout** for phones and laptops, with keyboard focus styles and screen reader friendly messages

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home: search box, service summary, next departures |
| `routes.html` | Directory with search and filters |
| `route.html?id=` | Details of one route |
| `planner.html` | Find a bus between two stops |
| `manage.html` | Add or update a route, change status, delete |
| `privacy.html`, `terms.html` | Policy pages linked in the footer |

## Project structure

```
.
├── index.html
├── routes.html
├── route.html
├── planner.html
├── manage.html
├── privacy.html
├── terms.html
├── style.css
├── app.js
├── favicon.svg
└── README.md
```

`app.js` is shared by every page. Each page sets `data-page` on its `<body>`, and the script runs only the code for the page that is open.

## How it works

Each route is stored as an object:

```js
{
  id, name, code, category, status,
  departures: ["07:30", "08:15"],
  stops: [{ n: "Library", m: 6 }],   // m = minutes after departure
  notes
}
```

- The time at any stop is the departure time plus that stop's minutes.
- The next bus is the first departure whose time at that stop is not earlier than the visitor's current time.
- Routes are saved in the browser with `localStorage`. If nothing is saved, four sample routes are loaded.

### Validation rules

- Route name: at least 3 characters
- Short code: 1 to 4 letters or numbers, unique
- Departure times: 24 hour `HH:MM`, at least one
- Stops: at least two, one per line as `stop name, minutes`; minutes must not decrease down the list

## Run locally

No build step or dependencies are needed.

1. Download or clone the repository.
2. Open `index.html` in a browser.

## Deploy on GitHub Pages

1. Push the files to a public repository with `index.html` at the top level.
2. Go to **Settings**, then **Pages**.
3. Under **Source** choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. The site is published at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/` after a minute or two.

A custom domain can be added under the same Pages settings by adding the DNS records GitHub lists at your domain registrar. Enable **Enforce HTTPS** once it is offered.

## Limitations

- There is no backend or database. Changes are saved only in each visitor's browser, so they are not shared between users.
- There is no login, so anyone can edit their own copy of the data.
- The map is a schematic stop diagram, not a real geographic map.
- There is no live bus tracking. Delays depend on someone updating the status.
- Timings are a single list and do not handle weekdays or holidays.
- The sample routes are placeholders. Replace them with real campus data.

## Future scope

- A database with an admin login so one transport office updates routes for everyone
- Stops on a real campus map and live bus location
- Delay alerts and timetables by day of the week

## Team

| Name | Roll number | Section |
|---|---|---|
| [Name 1] | [Roll number] | [Section] |
| [Name 2] | [Roll number] | [Section] |
| [Name 3] | [Roll number] | [Section] |

Course: CSE 326, Continuous Assessment

## License

Add a license of your choice (for example MIT) or remove this section if the repository is only for coursework.
