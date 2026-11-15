// Ce garde-fou reste actif même si components.js ne se charge ou ne s'exécute pas.
{
  const status = document.querySelector("[data-components-status]");
  if (status) {
    const fail = () => {
      if (!status.isConnected) return;
      status.textContent =
        "Impossible de charger les composants. Vérifiez la connexion et rechargez la page via le serveur HTTP.";
      status.setAttribute("role", "alert");
    };
    // Un délai long n'est pas une preuve d'échec réseau.
    const timeout = setTimeout(() => {
      if (status.isConnected)
        status.textContent =
          "Le chargement des composants prend plus de temps que prévu…";
    }, 12000);
    const scriptURL = new URL("components.js", document.baseURI).href;
    const stop = () => {
      clearTimeout(timeout);
      window.removeEventListener("error", onError, true);
      window.removeEventListener("sakina:components-settled", stop);
    };
    const onError = (event) => {
      if (event.target?.src === scriptURL || event.filename === scriptURL) {
        stop();
        fail();
      }
    };
    window.addEventListener("error", onError, true);
    window.addEventListener("sakina:components-settled", stop, { once: true });
  }
}

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
  toggle
    .querySelector(".icon")
    .style.setProperty(
      "--i",
      `url(icons/${dark ? "light_mode" : "dark_mode"}.svg)`,
    );
}

applyTheme(
  localStorage.getItem("sakina-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
);

toggle.addEventListener("click", () => {
  const theme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("sakina-theme", theme);
  applyTheme(theme);
});
