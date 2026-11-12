"use strict";

/* ---------- Mobile navigation ---------- */
const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("menu");
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});

/* ---------- Homepage: time-based greeting (dynamic content) ---------- */
const greeting = document.getElementById("greeting");
if (greeting) {
  const hour = new Date().getHours();
  greeting.textContent = hour < 12 ? "Good morning, and welcome" : hour < 17 ? "Good afternoon, and welcome" : "Good evening, and welcome";
}

/* ---------- Academic planner ---------- */
const taskForm = document.getElementById("task-form");
if (taskForm) {
  const input = document.getElementById("task-input");
  const due = document.getElementById("task-due");
  const list = document.getElementById("task-list");
  const errorBox = document.getElementById("task-error");
  const empty = document.getElementById("task-empty");
  const count = document.getElementById("task-count");
  let tasks = [];                       // array of {id, text, due, done}

  try { tasks = JSON.parse(localStorage.getItem("tasks")) || []; } catch (e) { tasks = []; }

  const save = () => { try { localStorage.setItem("tasks", JSON.stringify(tasks)); } catch (e) {} };

  function addTask(text, dueDate) {
    tasks.push({ id: Date.now(), text, due: dueDate, done: false });
    save(); render();
  }
  function toggleTask(id) {
    const t = tasks.find(t => t.id === id);
    if (t) t.done = !t.done;
    save(); render();
  }
  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save(); render();
  }

  function render() {
    list.innerHTML = "";
    const today = new Date().toISOString().slice(0, 10);
    tasks.forEach(t => {
      const li = document.createElement("li");
      li.className = (t.done ? "done " : "") + (!t.done && t.due && t.due < today ? "overdue" : "");

      const box = document.createElement("input");
      box.type = "checkbox"; box.checked = t.done;
      box.setAttribute("aria-label", "Mark \"" + t.text + "\" as completed");
      box.addEventListener("change", () => toggleTask(t.id));

      const label = document.createElement("span");
      label.className = "label";
      label.textContent = t.text;
      if (t.due) {
        const d = document.createElement("span");
        d.className = "due";
        d.textContent = "Due " + new Date(t.due + "T00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
        label.appendChild(d);
      }

      const del = document.createElement("button");
      del.type = "button"; del.className = "del"; del.textContent = "Delete";
      del.setAttribute("aria-label", "Delete \"" + t.text + "\"");
      del.addEventListener("click", () => deleteTask(t.id));

      li.append(box, label, del);
      list.appendChild(li);
    });
    const remaining = tasks.filter(t => !t.done).length;
    empty.hidden = tasks.length > 0;
    count.textContent = tasks.length ? remaining + " of " + tasks.length + " tasks left" : "";
  }

  taskForm.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) { errorBox.textContent = "Type a task before adding it."; input.focus(); return; }
    errorBox.textContent = "";
    addTask(text, due.value);
    taskForm.reset(); input.focus();
  });
  document.getElementById("clear-done").addEventListener("click", () => {
    tasks = tasks.filter(t => !t.done); save(); render();
  });
  render();
}

/* ---------- Contact form validation ---------- */
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  const rules = {
    name:    v => v ? "" : "Enter your name.",
    email:   v => !v ? "Enter your email address." : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter a valid email, like name@example.com.",
    phone:   v => !v ? "Enter your phone number." : /^\d+$/.test(v) ? "" : "Use digits only, with no spaces, dashes or +.",
    message: v => v ? "" : "Write a message."
  };
  const showError = (field, msg) => {
    contactForm.querySelector('[data-for="' + field + '"]').textContent = msg;
    contactForm.elements[field].classList.toggle("invalid", Boolean(msg));
  };
  const check = field => {
    const msg = rules[field](contactForm.elements[field].value.trim());
    showError(field, msg);
    return !msg;
  };
  Object.keys(rules).forEach(f => contactForm.elements[f].addEventListener("blur", () => check(f)));

  contactForm.addEventListener("submit", e => {
    e.preventDefault();
    const success = document.getElementById("form-success");
    success.textContent = "";
    const allValid = Object.keys(rules).map(check).every(Boolean);   // run every check so all errors show
    if (allValid) {
      success.textContent = "Message sent. Thanks, " + contactForm.elements.name.value.trim() + "!";
      contactForm.reset();
    }
  });
}
