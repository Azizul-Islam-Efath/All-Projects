
const signupTab = document.getElementById("signup-tab");
const signinTab = document.getElementById("signin-tab");
const signupForm = document.getElementById("signup-form");
const signinForm = document.getElementById("signin-form");
const errorMsg = document.getElementById("errorMsg");

if (localStorage.getItem("loggedInUser")) {
  window.location.href = "dash1.html";
}

signupTab.addEventListener("click", () => {
  signupTab.classList.add("active");
  signinTab.classList.remove("active");
  signupForm.classList.add("active");
  signinForm.classList.remove("active");
});

signinTab.addEventListener("click", () => {
  signinTab.classList.add("active");
  signupTab.classList.remove("active");
  signinForm.classList.add("active");
  signupForm.classList.remove("active");
});

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  if (!firstName || !lastName || !email || !password) {
    alert("Please fill in all fields!");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.some(u => u.email === email)) {
    alert("Email already registered! Please sign in.");
    return;
  }

  users.push({ firstName, lastName, email, password });
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("loggedInUser", email);
  window.location.href = "dash1.html";
});



signinForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("signinEmail").value.trim();
  const password = document.getElementById("signinPassword").value.trim();
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("loggedInUser", email);
    window.location.href = "dash1.html";
  } else {
    errorMsg.textContent = "Incorrect email or password!";
  }
});
