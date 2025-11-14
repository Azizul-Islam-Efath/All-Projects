// ===== ELEMENTS =====
const liveClock = document.getElementById("liveClock");
const datePicker = document.getElementById("datePicker");
const currentDateLabel = document.getElementById("currentDate");
const punchInBtn = document.getElementById("punchInBtn");
const punchOutBtn = document.getElementById("punchOutBtn");
const punchInTime = document.getElementById("punchInTime");
const punchOutTime = document.getElementById("punchOutTime");
const workedTime = document.getElementById("workedTime");
const expectedOut = document.getElementById("expectedOut");
const maxBreach = document.getElementById("maxBreach");
const recordTable = document.getElementById("recordTable").querySelector("tbody");
const resetBtn = document.getElementById("resetBtn");
const weekTotal = document.getElementById("weekTotal");
const ctx = document.getElementById("workChart").getContext("2d");
const themeToggle = document.getElementById("themeToggle");



// ===== UTILITIES =====
const formatTime = (date) => {
  let h = date.getHours();
  let m = date.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};
const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60000);
const getTodayISO = () => new Date().toISOString().split("T")[0];

// ===== STORAGE =====
let allPunches = JSON.parse(localStorage.getItem("allPunches")) || {};
let selectedDate = getTodayISO();

// ===== LIVE CLOCK =====
setInterval(() => {
  liveClock.textContent = formatTime(new Date());
}, 1000);

// ===== CHART =====
let workChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [{
      label: "Hours Worked",
      data: [],
      backgroundColor: "rgba(0, 255, 225, 0.6)",
      borderColor: "#00ffe1",
      borderWidth: 1,
      borderRadius: 6,
    }]
  },
  options: {
    scales: {
      x: { ticks: { color: "#ccc" }, grid: { color: "#223" } },
      y: { ticks: { color: "#ccc" }, grid: { color: "#223" } }
    },
    plugins: { legend: { labels: { color: "#00ffe1" } } },
  }
});

// ===== RENDER FUNCTIONS =====
function renderDate() {
  const d = new Date(selectedDate);
  datePicker.value = selectedDate;
  currentDateLabel.textContent = d.toDateString();
}
function renderDayData() {
  const data = allPunches[selectedDate];
  punchInTime.textContent = data?.punchIn || "--:--";
  punchOutTime.textContent = data?.punchOut || "--:--";
  workedTime.textContent = data?.worked || "0h 0m";
  expectedOut.textContent = data?.expected || "--:--";
  maxBreach.textContent = data?.breach || "--:--";
}
function renderWeeklyTable() {
  recordTable.innerHTML = "";
  const dates = Object.keys(allPunches).sort();
  let totalMins = 0;
  const labels = [];
  const hoursData = [];

  for (const d of dates.slice(-7)) {
    const { punchIn, punchOut, worked } = allPunches[d];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d}</td>
      <td>${punchIn || "--"}</td>
      <td>${punchOut || "--"}</td>
      <td>${worked || "0h 0m"}</td>`;
    recordTable.appendChild(tr);

    if (worked && worked !== "0h 0m") {
      const [h, m] = worked.match(/(\d+)h (\d+)m/).slice(1).map(Number);
      totalMins += h * 60 + m;
      labels.push(d);
      hoursData.push((h * 60 + m) / 60);
    }
  }

  const hours = Math.floor(totalMins / 60);
  const minutes = totalMins % 60;
  weekTotal.textContent = `${hours}h ${minutes}m`;

  // Update chart
  workChart.data.labels = labels;
  workChart.data.datasets[0].data = hoursData;
  workChart.update();
}
function saveData() {
  localStorage.setItem("allPunches", JSON.stringify(allPunches));
  renderWeeklyTable();
}

// ===== INIT =====
renderDate();
renderDayData();
renderWeeklyTable();

// ===== EVENTS =====
datePicker.addEventListener("change", () => {
  selectedDate = datePicker.value;
  renderDate();
  renderDayData();
});

punchInBtn.addEventListener("click", () => {
  const now = new Date();
  allPunches[selectedDate] = allPunches[selectedDate] || {};
  allPunches[selectedDate].punchIn = formatTime(now);
  allPunches[selectedDate].punchOut = "--:--";
  allPunches[selectedDate].worked = "0h 0m";
  allPunches[selectedDate].expected = formatTime(addMinutes(now, 8.5 * 60));
  allPunches[selectedDate].breach = formatTime(addMinutes(now, 10 * 60));
  saveData();
  renderDayData();
});

punchOutBtn.addEventListener("click", () => {
  const now = new Date();
  const record = allPunches[selectedDate];
  if (!record?.punchIn || record.punchIn === "--:--") {
    alert("Please punch in first!");
    return;
  }
  record.punchOut = formatTime(now);

  // Calculate worked time
  const [h, m, ap] = record.punchIn.match(/(\d+):(\d+) (\w+)/).slice(1);
  const inTime = new Date();
  inTime.setHours(ap === "PM" && h < 12 ? +h + 12 : +h, +m);
  const mins = Math.floor((now - inTime) / 60000);
  record.worked = `${Math.floor(mins / 60)}h ${mins % 60}m`;
  saveData();
  renderDayData();
});

resetBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all weekly data?")) {
    allPunches = {};
    localStorage.removeItem("allPunches");
    renderWeeklyTable();
    renderDayData();
  }
});

// ======Log Out Section =====
document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "index.html";
    });

// ===== THEME TOGGLE =====
function setTheme(mode) {
  document.body.className = mode;
  localStorage.setItem("theme", mode);
  themeToggle.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
}

themeToggle.addEventListener("click", () => {
  const newMode = document.body.classList.contains("dark") ? "light" : "dark";
  setTheme(newMode);
});



// Load theme on startup
const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);
