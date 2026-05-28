(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var siteNav = document.querySelector('#siteNav');

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var target = Number(dot.getAttribute('data-go-slide') || 0);
      showSlide(target);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5000);
  }

  document.querySelectorAll('img[data-fallback-title]').forEach(function (image) {
    image.addEventListener('error', function () {
      var frame = image.closest('.poster-frame');
      if (frame) {
        frame.setAttribute('data-title', image.getAttribute('data-fallback-title') || '');
        frame.classList.add('is-missing');
        image.remove();
      }
    });
  });

  var backToTop = document.querySelector('.back-to-top');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 600);
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
