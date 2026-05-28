(function () {
  var menuButton = document.querySelector(".mobile-menu-button");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function startHero() {
    if (timer) {
      clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-slide")) || 0);
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
      startHero();
    });
  }

  showSlide(0);
  startHero();

  var forms = Array.prototype.slice.call(document.querySelectorAll(".site-filter-form"));

  forms.forEach(function (form) {
    var root = form.closest("main") || document;
    var keywordInput = form.querySelector(".filter-keyword");
    var regionInput = form.querySelector(".filter-region");
    var yearInput = form.querySelector(".filter-year");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".searchable-grid .movie-card, .searchable-grid .ranking-item"));

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(keywordInput ? keywordInput.value : "");
      var region = normalize(regionInput ? regionInput.value : "");
      var year = normalize(yearInput ? yearInput.value : "");

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !region || cardRegion === region;
        var matchYear = !year || cardYear.indexOf(year) !== -1;

        card.classList.toggle("is-filter-hidden", !(matchKeyword && matchRegion && matchYear));
      });
    }

    [keywordInput, regionInput, yearInput].forEach(function (input) {
      if (input) {
        input.addEventListener("input", applyFilter);
        input.addEventListener("change", applyFilter);
      }
    });
  });
})();
