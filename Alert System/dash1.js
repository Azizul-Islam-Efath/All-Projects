
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
const themeToggle = document.getElementById("themeToggle");


const formatTime = (date) => {
  let h = date.getHours();
  let m = date.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";

if (h % 12 === 0) {
  h = 12;
} else {
  h = h % 12;
}
  return `${h}:${m} ${ampm}`;
};

const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60000);
const getTodayISO = () => new Date().toISOString().split("T")[0];
const timeToDate = (timeStr) => {
  if (!timeStr || timeStr === "--:--") return null;
  
  const [h, m, ap] = timeStr.match(/(\d+):(\d+) (\w+)/).slice(1);
  const date = new Date();
  let hours = +h;
  if (ap === "PM" && hours < 12) 
    hours += 12;
  else if (ap === "AM" && hours === 12) 
    hours = 0; 
  date.setHours(hours, +m, 0, 0);
  return date;
};


let allPunches = JSON.parse(localStorage.getItem("allPunches")) || {};
let selectedDate = getTodayISO();
let workingInterval = null;


setInterval(() => {
  liveClock.textContent = formatTime(new Date());
}, 1000);


function renderDate() {
  const d = new Date(selectedDate);
  datePicker.value = selectedDate;
  currentDateLabel.textContent = d.toDateString();
}

function calculateWorkedTime(punchInTimeStr, punchOutTimeStr) {
  const inDate = timeToDate(punchInTimeStr);
  const outDate = timeToDate(punchOutTimeStr);

  if (!inDate || !outDate) return "0h 0m";

  const mins = Math.floor((outDate - inDate) / 60000);
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function renderDayData() {
  const data = allPunches[selectedDate];
  punchInTime.textContent = data?.punchIn || "--:--";
  punchOutTime.textContent = data?.punchOut || "--:--";
  workedTime.textContent = data?.worked || "0h 0m";
  expectedOut.textContent = data?.expected || "--:--";
  maxBreach.textContent = data?.breach || "--:--";


  if (selectedDate === getTodayISO() && data?.punchIn && !data.punchOut || data?.punchOut === "--:--") {
    if (!workingInterval) {
      workingInterval = setInterval(updateCurrentWorkAndCheckAlert, 1000);
    }
  } else {
    clearInterval(workingInterval);
    workingInterval = null;
  }
}

function renderWeeklyTable() {
  recordTable.innerHTML = "";
  const dates = Object.keys(allPunches).sort();
  let totalMins = 0;

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
      const match = worked.match(/(\d+)h (\d+)m/);
      if (match) {
        const [h, m] = match.slice(1).map(Number);
        totalMins += h * 60 + m;
      }
    }
  }

  const hours = Math.floor(totalMins / 60);
  const minutes = totalMins % 60;
  weekTotal.textContent = `${hours}h ${minutes}m`;

}

function saveData() {
  localStorage.setItem("allPunches", JSON.stringify(allPunches));
  renderWeeklyTable();
}


let alertTriggered = false;
const PENALTY_BREACH_MINS = 10 * 60;
const ALERT_THRESHOLD_MINS = 1; // 9 hours 30 minutes                     *************************

function updateCurrentWorkAndCheckAlert() {
  const today = getTodayISO();
  const record = allPunches[today];

  if (record?.punchIn && (record.punchOut === "--:--" || !record.punchOut)) {
    const inDate = timeToDate(record.punchIn);
    const now = new Date();
    const workedMins = Math.floor((now - inDate) / 60000);
    
    
    const hours = Math.floor(workedMins / 60);
    const minutes = workedMins % 60;
    record.worked = `${hours}h ${minutes}m`;
    workedTime.textContent = record.worked;

if (workedMins >= ALERT_THRESHOLD_MINS && workedMins < PENALTY_BREACH_MINS && !alertTriggered) {

    const alarm = document.getElementById("alarmSound");
    alarm.currentTime = 0;

    
    alarm.play().then(() => {
        alert("⚠️ You have only 30 minutes left before breaching the 10-hour penalty threshold!");
        alarm.pause();    
        alarm.currentTime = 0;

    }).catch(err => {
        console.log("Autoplay blocked, trying again after alert:", err);


        alert("⚠️ You have only 30 minutes left before breaching the 10-hour penalty threshold!");


        alarm.play();
        setTimeout(() => {
            alarm.pause();
            alarm.currentTime = 0;
        }, 20000); 
    });

    alertTriggered = true;
}   else if (workedMins < ALERT_THRESHOLD_MINS) {
      alertTriggered = false;
    }

    allPunches[today] = record; 
    localStorage.setItem("allPunches", JSON.stringify(allPunches));

  } else {
    clearInterval(workingInterval);
    workingInterval = null;
    alertTriggered = false;
  }
}


renderDate();
renderDayData();
renderWeeklyTable();


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
  allPunches[selectedDate].expected = formatTime(addMinutes(now, 8 * 60));
  allPunches[selectedDate].breach = formatTime(addMinutes(now, 10 * 60));
  saveData();
  renderDayData(); 
});

punchOutBtn.addEventListener("click", () => {
  const now = new Date();
  const record = allPunches[selectedDate];
  
  clearInterval(workingInterval); 
  workingInterval = null;
  alertTriggered = false;

  if (!record?.punchIn || record.punchIn === "--:--") {
    alert("Please punch in first!");
    return;
  }
  record.punchOut = formatTime(now);

  record.worked = calculateWorkedTime(record.punchIn, record.punchOut);
  
  saveData();
  renderDayData();
});

resetBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all weekly data?")) {
    allPunches = {};
    localStorage.removeItem("allPunches");
    clearInterval(workingInterval);
    workingInterval = null;
    renderWeeklyTable();
    renderDayData();
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "index1.html";
    });

function setTheme(mode) {
  document.body.className = mode;
  localStorage.setItem("theme", mode);
  themeToggle.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
}

themeToggle.addEventListener("click", () => {
  const newMode = document.body.classList.contains("dark") ? "light" : "dark";
  setTheme(newMode);
});

const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);

renderDayData();