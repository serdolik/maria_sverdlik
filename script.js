const galleries = {
  works: {
    dataUrl: "data/works.json",
    gallery: document.querySelector('[data-gallery="works"]'),
    filters: document.querySelector('[data-filters="works"]'),
    items: [],
    activeCategory: "Все"
  },
  students: {
    dataUrl: "data/students.json",
    gallery: document.querySelector('[data-gallery="students"]'),
    filters: document.querySelector('[data-filters="students"]'),
    items: [],
    activeCategory: "Все"
  }
};

const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const dialog = document.querySelector("[data-dialog]");
const dialogImage = document.querySelector("[data-dialog-image]");
const dialogTitle = document.querySelector("[data-dialog-title]");
const dialogMeta = document.querySelector("[data-dialog-meta]");
const dialogDescription = document.querySelector("[data-dialog-description]");

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

document.querySelector("[data-dialog-close]").addEventListener("click", () => {
  dialog.close();
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});

async function loadGallery(key) {
  const state = galleries[key];
  const response = await fetch(state.dataUrl);
  state.items = (await response.json()).sort((a, b) => a.order - b.order);
  renderFilters(key);
  renderGallery(key);
}

function renderFilters(key) {
  const state = galleries[key];
  const categories = ["Все", ...new Set(state.items.map((item) => item.category))];

  state.filters.innerHTML = categories
    .map((category) => {
      const activeClass = category === state.activeCategory ? " active" : "";
      return `<button class="filter-button${activeClass}" type="button" data-category="${category}">${category}</button>`;
    })
    .join("");

  state.filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    state.activeCategory = button.dataset.category;
    renderFilters(key);
    renderGallery(key);
  }, { once: true });
}

function renderGallery(key) {
  const state = galleries[key];
  const items = state.activeCategory === "Все"
    ? state.items
    : state.items.filter((item) => item.category === state.activeCategory);

  state.gallery.scrollTop = 0;
  state.gallery.innerHTML = `
    <div class="gallery-grid">
      ${items.map(renderCard).join("")}
    </div>
  `;

  state.gallery.querySelectorAll("[data-art-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const item = items.find((entry) => entry.id === card.dataset.artId);
      openArtwork(item);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const item = items.find((entry) => entry.id === card.dataset.artId);
      openArtwork(item);
    });
  });
}

function renderCard(item) {
  return `
    <article class="art-card" data-art-id="${item.id}" tabindex="0" role="button" aria-label="Открыть работу ${item.title}">
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <div class="art-card-body">
        <h3>${item.title}</h3>
        <p>${item.year} / ${item.category} / ${item.technique}</p>
      </div>
    </article>
  `;
}

function openArtwork(item) {
  dialogImage.src = item.image;
  dialogImage.alt = item.title;
  dialogTitle.textContent = item.title;
  dialogMeta.textContent = `${item.year} / ${item.category} / ${item.technique}`;
  dialogDescription.textContent = item.description;
  dialog.showModal();
}

function updateActiveNav() {
  const sections = [...document.querySelectorAll(".screen")];
  const links = [...document.querySelectorAll(".site-nav a")];
  const active = sections
    .map((section) => ({
      id: section.id,
      distance: Math.abs(section.getBoundingClientRect().top - Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height"), 10))
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  links.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${active.id}`);
  });
}

Object.keys(galleries).forEach(loadGallery);
document.addEventListener("scroll", updateActiveNav, { passive: true });
window.addEventListener("resize", updateActiveNav);
updateActiveNav();
