// Light/dark switch shared by every page. Choice kept in localStorage, default follows the OS.
// Elements with data-auto-theme get the .light/.dark token class; others keep their fixed theme.
const root = document.documentElement;
const toggle = document.querySelector(".theme-toggle");

function applyTheme(theme) {
  const dark = theme === "dark";
  root.dataset.theme = theme;
  document.querySelectorAll("[data-auto-theme]").forEach((el) => {
    el.classList.toggle("dark", dark);
    el.classList.toggle("light", !dark);
  });
  toggle.setAttribute("aria-pressed", dark);
  toggle.querySelector(".icon").textContent = dark ? "light_mode" : "dark_mode";
}

applyTheme(localStorage.getItem("sakina-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

toggle.addEventListener("click", () => {
  const theme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("sakina-theme", theme);
  applyTheme(theme);
});
