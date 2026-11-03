// Campus Bus Portal. Plain JavaScript shared by every page.
// Route data is saved in the browser (localStorage) so edits survive a refresh.
var KEY = "campusBusRoutes";
var SAMPLE = [
  {id:1,name:"Hostel Loop",code:"H1",category:"Hostel",status:"Running",departures:["07:30","08:15","09:00","13:00","17:30"],notes:"Runs Monday to Saturday",
   stops:[{n:"Hostel Block A",m:0},{n:"Hostel Block C",m:4},{n:"Central Library",m:9},{n:"Main Academic Block",m:14}]},
  {id:2,name:"Academic Shuttle",code:"A2",category:"Academic",status:"Running",departures:["08:00","09:30","11:00","14:00","16:00"],notes:"",
   stops:[{n:"Main Academic Block",m:0},{n:"Central Library",m:5},{n:"Admin Office",m:9},{n:"Lab Complex",m:13}]},
  {id:3,name:"Main Gate Link",code:"G3",category:"Gate and city",status:"Delayed",departures:["07:45","10:00","12:30","15:30","18:00"],notes:"Delayed by road work near the gate",
   stops:[{n:"Hostel Block A",m:0},{n:"Central Library",m:7},{n:"Admin Office",m:11},{n:"Main Gate",m:16}]},
  {id:4,name:"Sports Complex Run",code:"S4",category:"Sports and gym",status:"Suspended",departures:["06:00","17:00","19:00"],notes:"Suspended until further notice",
   stops:[{n:"Main Gate",m:0},{n:"Hostel Block C",m:6},{n:"Sports Complex",m:12}]}
];
var routes = load();
var page = document.body.getAttribute("data-page");
var params = new URLSearchParams(location.search);

function load(){
  try { var s = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(s) && s.length) return s; } catch(e){}
  return JSON.parse(JSON.stringify(SAMPLE));
}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(routes)); } catch(e){ say("Could not save. Browser storage may be blocked.", true); } }
function $(id){ return document.getElementById(id); }
function esc(t){ var d = document.createElement("div"); d.textContent = t; return d.innerHTML; }
function say(text, isError){
  $("msg").innerHTML = '<div class="' + (isError ? "err" : "ok") + '">' + esc(text) + "</div>";
  window.scrollTo(0, 0);
}
function find(id){ for (var i = 0; i < routes.length; i++) if (String(routes[i].id) === String(id)) return routes[i]; return null; }
function toMin(t){ var p = t.split(":"); return Number(p[0]) * 60 + Number(p[1]); }
function toText(m){ m = m % 1440; var h = Math.floor(m / 60), mm = m % 60; return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm; }
function nowMin(){ var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
function nextAt(route, offset){
  var list = route.departures.map(toMin).sort(function(a,b){ return a - b; });
  for (var i = 0; i < list.length; i++) if (list[i] + offset >= nowMin()) return list[i] + offset;
  return null;
}
function badge(r){ return '<span class="badge">' + esc(r.code) + "</span>"; }

// ---------- Home ----------
function homePage(){
  var c = {Running:0, Delayed:0, Suspended:0}, names = {};
  routes.forEach(function(r){ c[r.status]++; r.stops.forEach(function(s){ names[s.n] = 1; }); });
  $("stats").innerHTML =
    '<div class="stat"><b>' + routes.length + "</b>Routes</div>" +
    '<div class="stat"><b>' + Object.keys(names).length + "</b>Stops</div>" +
    '<div class="stat s-ok"><b>' + c.Running + "</b>Running</div>" +
    '<div class="stat s-warn"><b>' + c.Delayed + "</b>Delayed</div>" +
    '<div class="stat s-bad"><b>' + c.Suspended + "</b>Suspended</div>";
  var rows = "";
  routes.filter(function(r){ return r.status !== "Suspended"; }).forEach(function(r){
    var n = nextAt(r, 0);
    rows += '<tr><td>' + badge(r) + ' <a href="route.html?id=' + r.id + '">' + esc(r.name) + "</a></td><td>" + esc(r.stops[0].n) + "</td><td>" +
      (n === null ? "No more buses today" : toText(n)) + '</td><td class="st ' + r.status + '">' + r.status + "</td></tr>";
  });
  $("nextTable").innerHTML = "<tr><th>Route</th><th>Starts at</th><th>Next departure</th><th>Status</th></tr>" +
    (rows || '<tr><td colspan="4">No active routes. <a href="manage.html">Add a route</a>.</td></tr>');
}

// ---------- Routes directory ----------
function routesPage(){
  $("search").value = params.get("q") || "";
  ["search","filterCat","filterStatus"].forEach(function(id){ $(id).addEventListener("input", drawList); });
  drawList();
}
function drawList(){
  var q = $("search").value.trim().toLowerCase(), cat = $("filterCat").value, st = $("filterStatus").value;
  var list = routes.filter(function(r){
    var hay = (r.name + " " + r.code + " " + r.stops.map(function(s){ return s.n; }).join(" ")).toLowerCase();
    return (!q || hay.indexOf(q) > -1) && (!cat || r.category === cat) && (!st || r.status === st);
  });
  $("count").textContent = list.length + " of " + routes.length + " routes shown";
  var html = "";
  list.forEach(function(r){
    var n = nextAt(r, 0);
    html += '<article class="route"><header><div>' + badge(r) + ' <h2><a href="route.html?id=' + r.id + '">' + esc(r.name) + "</a></h2></div>" +
      '<span class="st ' + r.status + '">' + r.status + "</span></header>" +
      '<p class="meta">' + esc(r.category) + ". " + esc(r.stops[0].n) + " to " + esc(r.stops[r.stops.length - 1].n) + ". Next departure: " + (n === null ? "none today" : toText(n)) + "</p></article>";
  });
  $("routeList").innerHTML = html || '<p class="hint">No routes match. Clear the search or filters.</p>';
}

// ---------- Route detail ----------
function routePage(){
  var r = find(params.get("id")), box = $("routeDetail");
  if (!r) { box.innerHTML = '<h1>Route not found</h1><p>This route may have been deleted. <a href="routes.html">Go back to all routes</a>.</p>'; return; }
  document.title = r.name + " | Campus Bus Portal";
  var nx = nextAt(r, 0), times = r.departures.slice().sort().map(function(t){
    return "<span" + (nx !== null && toMin(t) === nx ? ' class="next"' : "") + ">" + t + "</span>";
  }).join("");
  box.innerHTML = "<h1>" + badge(r) + " " + esc(r.name) + '</h1><p class="meta">' + esc(r.category) + '. Status: <span class="st ' + r.status + '">' + r.status + "</span></p>" +
    (r.notes ? '<p class="meta">Note: ' + esc(r.notes) + "</p>" : "") +
    '<div class="detail"><div><h2>Stops</h2>' + mapSvg(r) + '</div><div><h2>Departures from ' + esc(r.stops[0].n) + "</h2>" +
    '<p class="times">' + times + '</p><p class="hint">The dark time is the next departure today. Other stops are reached after the minutes shown on the map.</p>' +
    '<a class="btn ghost" href="manage.html?id=' + r.id + '">Edit this route</a></div></div>';
}
function mapSvg(r){
  var h = r.stops.length * 44 + 20, s = '<svg width="270" height="' + h + '" role="img" aria-label="Stops on ' + esc(r.name) + '">';
  s += '<line x1="20" y1="30" x2="20" y2="' + (h - 30) + '" stroke="#14213d" stroke-width="5"/>';
  r.stops.forEach(function(p, i){
    var y = 30 + i * 44, end = i === 0 || i === r.stops.length - 1;
    s += '<circle cx="20" cy="' + y + '" r="' + (end ? 9 : 6) + '" fill="' + (end ? "#ffc300" : "#fff") + '" stroke="#14213d" stroke-width="3"/>' +
      '<text x="38" y="' + (y + 1) + '" font-size="14" fill="#14213d">' + esc(p.n) + '</text><text x="38" y="' + (y + 16) + '" font-size="12" fill="#4a5568">+' + p.m + " min</text>";
  });
  return s + "</svg>";
}

// ---------- Planner ----------
function plannerPage(){
  var seen = {}; routes.forEach(function(r){ r.stops.forEach(function(s){ seen[s.n] = 1; }); });
  var opts = Object.keys(seen).sort().map(function(s){ return "<option>" + esc(s) + "</option>"; }).join("");
  $("fromStop").innerHTML = opts; $("toStop").innerHTML = opts;
  if ($("toStop").options.length > 1) $("toStop").selectedIndex = 1;
  $("plannerForm").addEventListener("submit", function(e){
    e.preventDefault();
    var from = $("fromStop").value, to = $("toStop").value, html = "";
    if (!from || !to) { $("plannerResult").innerHTML = ""; return say("Add routes first, then choose both stops.", true); }
    if (from === to) { $("plannerResult").innerHTML = ""; return say("Choose two different stops.", true); }
    $("msg").innerHTML = "";
    routes.forEach(function(r){
      var a = idx(r, from), b = idx(r, to);
      if (a < 0 || b < 0 || a > b) return;
      var n = nextAt(r, r.stops[a].m);
      html += '<article class="route"><header><div>' + badge(r) + ' <h2><a href="route.html?id=' + r.id + '">' + esc(r.name) + '</a></h2></div><span class="st ' + r.status + '">' + r.status + "</span></header>" +
        '<p class="meta">Next bus at ' + esc(from) + ": <b>" + (n === null ? "none left today" : toText(n)) + "</b>. Arrives at " + esc(to) + " about " + (r.stops[b].m - r.stops[a].m) + " minutes later.</p></article>";
    });
    $("plannerResult").innerHTML = html || '<p class="hint">No single route covers that trip in that direction. Try swapping the stops.</p>';
  });
}
function idx(r, name){ for (var i = 0; i < r.stops.length; i++) if (r.stops[i].n === name) return i; return -1; }

// ---------- Add or update ----------
function managePage(){
  drawManage();
  var r = find(params.get("id"));
  if (r) fillForm(r);
  $("cancelBtn").addEventListener("click", clearForm);
  $("routeForm").addEventListener("submit", submitForm);
  $("resetBtn").addEventListener("click", function(){
    if (!confirm("Replace all routes with the sample data?")) return;
    routes = JSON.parse(JSON.stringify(SAMPLE)); save(); drawManage(); say("Sample data restored.");
  });
}
function fillForm(r){
  $("routeId").value = r.id; $("name").value = r.name; $("code").value = r.code; $("category").value = r.category; $("status").value = r.status;
  $("departures").value = r.departures.join(", "); $("notes").value = r.notes || "";
  $("stops").value = r.stops.map(function(s){ return s.n + ", " + s.m; }).join("\n");
  $("formTitle").textContent = "Update route"; $("saveBtn").textContent = "Update route";
}
function clearForm(){
  $("routeForm").reset(); $("routeId").value = ""; $("formTitle").textContent = "Add a route"; $("saveBtn").textContent = "Save route";
  history.replaceState(null, "", "manage.html");
}
function drawManage(){
  var rows = "";
  routes.forEach(function(r){
    rows += "<tr><td>" + badge(r) + " " + esc(r.name) + '</td><td><select data-id="' + r.id + '" data-a="status" aria-label="Status for ' + esc(r.name) + '">' +
      ["Running","Delayed","Suspended"].map(function(s){ return "<option" + (s === r.status ? " selected" : "") + ">" + s + "</option>"; }).join("") +
      '</select></td><td><button class="btn small ghost" data-id="' + r.id + '" data-a="edit">Edit</button> <button class="btn small danger" data-id="' + r.id + '" data-a="del">Delete</button></td></tr>';
  });
  $("manageTable").innerHTML = "<tr><th>Route</th><th>Status</th><th>Actions</th></tr>" + (rows || '<tr><td colspan="3">No routes yet. Use the form above.</td></tr>');
}
document.addEventListener("click", function(e){
  if (page !== "manage") return;
  var a = e.target.getAttribute("data-a"), r = find(e.target.getAttribute("data-id"));
  if (a === "edit" && r) { fillForm(r); window.scrollTo(0, 0); }
  if (a === "del" && r && confirm("Delete " + r.name + "? This cannot be undone.")) {
    routes = routes.filter(function(x){ return x.id !== r.id; }); save(); drawManage(); say(r.name + " was deleted.");
  }
});
document.addEventListener("change", function(e){
  if (page !== "manage" || e.target.getAttribute("data-a") !== "status") return;
  var r = find(e.target.getAttribute("data-id")); r.status = e.target.value; save(); say(r.name + " is now " + r.status + ".");
});
function submitForm(e){
  e.preventDefault();
  var id = $("routeId").value, name = $("name").value.trim(), code = $("code").value.trim().toUpperCase();
  if (name.length < 3) return say("Route name needs at least 3 characters.", true);
  if (!/^[A-Z0-9]{1,4}$/.test(code)) return say("Short code must be 1 to 4 letters or numbers, for example H1.", true);
  var dup = routes.some(function(r){ return String(r.id) !== id && (r.code === code || r.name.toLowerCase() === name.toLowerCase()); });
  if (dup) return say("Another route already uses that name or code.", true);
  var deps = $("departures").value.split(",").map(function(t){ return t.trim(); }).filter(Boolean);
  if (!deps.length) return say("Enter at least one departure time.", true);
  for (var i = 0; i < deps.length; i++) if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(deps[i])) return say('"' + deps[i] + '" is not a valid time. Use 24 hour format like 07:30.', true);
  var lines = $("stops").value.split("\n").map(function(l){ return l.trim(); }).filter(Boolean), stops = [], last = -1;
  if (lines.length < 2) return say("Enter at least two stops, one per line.", true);
  for (var j = 0; j < lines.length; j++) {
    var cut = lines[j].lastIndexOf(","), n = lines[j].slice(0, cut).trim(), mText = lines[j].slice(cut + 1).trim(), m = Number(mText);
    if (cut < 1 || !n || mText === "" || isNaN(m) || m < 0) return say('Line ' + (j + 1) + ' should look like "Library, 6".', true);
    if (m < last) return say("Minutes must not go down from one stop to the next (line " + (j + 1) + ").", true);
    last = m; stops.push({n: n, m: m});
  }
  var rec = {id: id ? Number(id) : Date.now(), name: name, code: code, category: $("category").value, status: $("status").value,
    departures: deps, stops: stops, notes: $("notes").value.trim()};
  if (id) routes = routes.map(function(r){ return String(r.id) === id ? rec : r; }); else routes.push(rec);
  save(); clearForm(); drawManage(); say(name + (id ? " was updated." : " was added."));
}

if (page === "home") homePage();
if (page === "routes") routesPage();
if (page === "route") routePage();
if (page === "planner") plannerPage();
if (page === "manage") managePage();
