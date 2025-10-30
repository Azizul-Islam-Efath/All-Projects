const signupTab = document.getElementById("signup-tab");
const signinTab = document.getElementById("signin-tab");
const signupForm = document.getElementById("signup-form");
const signinForm = document.getElementById("signin-form");

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
