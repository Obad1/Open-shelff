const form = document.getElementById("signupForm");
const message = document.getElementById("message");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    message.textContent = "Please fill in all fields.";
    message.style.color = "red";
    return;
  }

  // Simulate success
  message.textContent = "Account created successfully!";
  message.style.color = "green";

  // Optionally redirect to login page after delay
  // setTimeout(() => window.location.href = "login.html", 2000);
});
