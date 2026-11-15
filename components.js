// Les templates de la vitrine sont la source unique des composants partagés.
(async () => {
  const main = document.querySelector("[data-components-pending]");
  const status = document.querySelector("[data-components-status]");
  try {
    let source = document;
    if (!document.querySelector("template[data-component-template]")) {
      const response = await fetch("design-system.html", {
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      source = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      );
    }
    const templates = new Map(
      [...source.querySelectorAll("template[data-component-template]")].map(
        (template) => [template.dataset.componentTemplate, template],
      ),
    );

    function render(host, ancestors = []) {
      const template = templates.get(host.dataset.component);
      if (!template)
        throw new Error(`Composant inconnu : ${host.dataset.component}`);
      if (ancestors.includes(host.dataset.component))
        throw new Error(`Composant récursif : ${host.dataset.component}`);
      const fragment = document.importNode(template.content, true);
      const element = fragment.firstElementChild;
      if (
        fragment.childElementCount !== 1 ||
        [...fragment.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
        )
      )
        throw new Error(`Template invalide : ${host.dataset.component}`);
      for (const attribute of host.attributes) {
        if (attribute.name === "class")
          element.classList.add(...host.classList);
        else if (attribute.name === "style")
          element.style.cssText += `;${attribute.value}`;
        else if (!attribute.name.startsWith("data-"))
          element.setAttribute(attribute.name, attribute.value);
      }
      fragment.querySelectorAll("[data-param]").forEach((target) => {
        const value = host.getAttribute(`data-${target.dataset.param}`);
        if (value !== null) target.textContent = value;
        target.removeAttribute("data-param");
      });
      if (host.hasAttribute("data-send-label")) {
        fragment
          .querySelector(".send")
          .setAttribute("aria-label", host.dataset.sendLabel);
      }
      fragment.querySelectorAll("slot").forEach((slot) => {
        const content = [...host.children].find(
          (child) => child.getAttribute("slot") === slot.name,
        );
        if (content) slot.replaceWith(...content.childNodes);
        else slot.parentElement.remove();
      });
      fragment.querySelectorAll("[data-component]").forEach((child) => {
        child.replaceWith(
          render(child, [...ancestors, host.dataset.component]),
        );
      });
      if (fragment.firstElementChild !== element)
        throw new Error(`Racine supprimée : ${host.dataset.component}`);
      return fragment;
    }

    // Préparer tous les clones avant de toucher au document évite un rendu partiel.
    const hosts = [...document.querySelectorAll("[data-component]")];
    const fragments = hosts.map((host) => render(host.cloneNode(true)));
    hosts.forEach((host, index) => host.replaceWith(fragments[index]));
    main.removeAttribute("data-components-pending");
    status.remove();
  } catch (error) {
    status.textContent =
      "Impossible de charger les composants. Vérifiez la connexion et rechargez la page via le serveur HTTP.";
    status.setAttribute("role", "alert");
    console.error("Échec du chargement des composants Sakina :", error);
  } finally {
    window.dispatchEvent(new Event("sakina:components-settled"));
  }
})();
