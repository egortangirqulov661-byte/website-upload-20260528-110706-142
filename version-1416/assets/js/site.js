const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("is-open");
  });
}

const carousel = document.querySelector("[data-hero-carousel]");
if (carousel) {
  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
  let active = 0;
  const showSlide = (next) => {
    if (!slides.length) {
      return;
    }
    active = (next + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === active);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === active);
    });
  };
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });
  window.setInterval(() => showSlide(active + 1), 5200);
}

const searchForm = document.querySelector("[data-search-form]");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");

const escapeHTML = (value) => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const buildResultCard = (movie) => {
  const title = escapeHTML(movie.title);
  const region = escapeHTML(movie.region);
  const category = escapeHTML(movie.category);
  const oneLine = escapeHTML(movie.oneLine);
  const url = escapeHTML(movie.url);
  const image = escapeHTML(movie.image);
  const categoryUrl = escapeHTML(movie.categoryUrl);
  const year = escapeHTML(movie.year);
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
  return `
    <article class="movie-card movie-card-compact">
      <a class="poster-frame" href="${url}" aria-label="${title}">
        <img src="${image}" alt="${title}" loading="lazy" onerror="this.classList.add('is-hidden')">
        <span class="poster-glow"></span>
        <span class="poster-year">${year}</span>
      </a>
      <div class="movie-card-body">
        <div class="movie-meta-line">
          <a href="${categoryUrl}">${category}</a>
          <span>${region}</span>
        </div>
        <h2><a href="${url}">${title}</a></h2>
        <p>${oneLine}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>
  `;
};

const runSearch = () => {
  if (!searchInput || !searchResults || !Array.isArray(window.movieSearchItems)) {
    return;
  }
  const query = searchInput.value.trim().toLowerCase();
  const items = window.movieSearchItems;
  const filtered = query
    ? items.filter((movie) => movie.search.includes(query))
    : items.slice(0, 60);
  const limited = filtered.slice(0, 120);
  searchResults.innerHTML = limited.map(buildResultCard).join("");
};

if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    runSearch();
  });
  searchInput.addEventListener("input", runSearch);
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  if (query) {
    searchInput.value = query;
    runSearch();
  }
}
