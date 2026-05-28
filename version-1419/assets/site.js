function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.querySelector(".nav-panel");
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener("click", () => {
    const open = panel.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function initHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  if (slides.length < 2) {
    return;
  }
  let current = 0;
  const show = (next) => {
    current = (next + slides.length) % slides.length;
    slides.forEach((slide, index) => slide.classList.toggle("is-active", index === current));
    dots.forEach((dot, index) => dot.classList.toggle("is-active", index === current));
  };
  dots.forEach((dot) => {
    dot.addEventListener("click", () => show(Number(dot.dataset.heroDot || 0)));
  });
  window.setInterval(() => show(current + 1), 5200);
}

function initFilters() {
  document.querySelectorAll("[data-filter-list]").forEach((section) => {
    const cards = Array.from(section.querySelectorAll("[data-card]"));
    const input = section.querySelector("[data-filter-input]");
    const count = section.querySelector("[data-filter-count]");
    const fields = Array.from(section.querySelectorAll("[data-filter-field]"));
    if (!cards.length) {
      return;
    }
    const apply = () => {
      const query = normalizeText(input ? input.value : "");
      let visible = 0;
      cards.forEach((card) => {
        const searchText = normalizeText(card.dataset.search);
        const queryMatch = !query || searchText.includes(query);
        const fieldMatch = fields.every((field) => {
          const fieldName = field.dataset.filterField;
          const selected = normalizeText(field.value);
          return !selected || normalizeText(card.dataset[fieldName]) === selected;
        });
        const ok = queryMatch && fieldMatch;
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = `${visible} 部`;
      }
    };
    if (input) {
      input.addEventListener("input", apply);
    }
    fields.forEach((field) => field.addEventListener("change", apply));
    apply();
  });
}

function initPlayers() {
  document.querySelectorAll("[data-player]").forEach((player) => {
    const video = player.querySelector("video");
    const cover = player.querySelector(".player-cover");
    const button = player.querySelector("[data-play]");
    const stream = player.dataset.stream;
    let attached = false;
    let hls = null;
    if (!video || !stream) {
      return;
    }
    const attach = () => {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (globalThis.Hls && globalThis.Hls.isSupported()) {
        hls = new globalThis.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };
    const play = () => {
      player.classList.add("is-playing");
      attach();
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    };
    if (cover) {
      cover.addEventListener("click", play);
    }
    if (button) {
      button.addEventListener("click", play);
    }
    video.addEventListener("play", () => player.classList.add("is-playing"));
    video.addEventListener("error", () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      attached = false;
    });
  });
}

function movieCardTemplate(movie) {
  const tags = String(movie.tags || "")
    .split(/[、，,\/|;；]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((tag) => `<span>${escapeHtml(tag.trim())}</span>`)
    .join("");
  return `<article class="movie-card">
      <a class="poster-link" href="${escapeHtml(movie.url)}" aria-label="观看${escapeHtml(movie.title)}">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
      </a>
      <div class="movie-card-body">
        <div class="card-meta">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <h2><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h2>
        <p>${escapeHtml(movie.summary)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>`;
}

function initSearchPage() {
  const page = document.querySelector("[data-search-page]");
  if (!page || !Array.isArray(globalThis.MOVIE_SEARCH_DATA)) {
    return;
  }
  const form = page.querySelector("form");
  const input = page.querySelector("[data-search-input]");
  const results = page.querySelector("[data-search-results]");
  const status = page.querySelector("[data-search-status]");
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("q") || "";
  if (input) {
    input.value = initial;
  }
  const render = () => {
    const query = normalizeText(input ? input.value : "");
    const data = globalThis.MOVIE_SEARCH_DATA;
    const matched = query
      ? data.filter((movie) => normalizeText(movie.search).includes(query)).slice(0, 120)
      : data.slice(0, 48);
    if (status) {
      status.textContent = query ? `${matched.length} 条相关结果` : "输入关键词可查找更多片库内容";
    }
    if (results) {
      results.innerHTML = matched.map(movieCardTemplate).join("");
    }
  };
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const url = new URL(window.location.href);
      url.searchParams.set("q", input ? input.value : "");
      window.history.replaceState({}, "", url.toString());
      render();
    });
  }
  if (input) {
    input.addEventListener("input", render);
  }
  render();
}

ready(() => {
  initNavigation();
  initHero();
  initFilters();
  initPlayers();
  initSearchPage();
});
