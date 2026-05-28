(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-nav-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dotsWrap = slider.querySelector('[data-hero-dots]');
    if (!slides.length || !dotsWrap) {
      return;
    }
    var current = 0;
    var dots = slides.map(function (_, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'hero-dot' + (index === 0 ? ' active' : '');
      button.setAttribute('aria-label', '切换到第 ' + (index + 1) + ' 张焦点图');
      button.addEventListener('click', function () {
        show(index);
      });
      dotsWrap.appendChild(button);
      return button;
    });

    function show(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = index;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    window.setInterval(function () {
      show((current + 1) % slides.length);
    }, 5200);
  }

  function initListFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('.movie-list-scope'));
    scopes.forEach(function (scope) {
      var keywordInput = scope.querySelector('[data-list-filter]');
      var yearSelect = scope.querySelector('[data-year-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var emptyState = scope.querySelector('[data-empty-state]');
      if (!keywordInput && !yearSelect) {
        return;
      }

      function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
      }

      function filter() {
        var keyword = normalize(keywordInput ? keywordInput.value : '');
        var yearValue = normalize(yearSelect ? yearSelect.value : '');
        var visibleCount = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre')
          ].join(' '));
          var year = normalize(card.getAttribute('data-year'));
          var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
          var yearMatch = !yearValue || year.indexOf(yearValue) === 0;
          var matched = keywordMatch && yearMatch;
          card.hidden = !matched;
          if (matched) {
            visibleCount += 1;
          }
        });
        if (emptyState) {
          emptyState.hidden = visibleCount !== 0;
        }
      }

      if (keywordInput) {
        keywordInput.addEventListener('input', filter);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', filter);
      }
      filter();
    });
  }

  function initSearchPage() {
    var resultBox = document.getElementById('search-results');
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    if (!resultBox || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function render(value) {
      var keyword = normalize(value);
      if (!keyword) {
        resultBox.innerHTML = '<p class="empty-state">请输入关键词后开始搜索。</p>';
        return;
      }
      var results = window.MOVIE_INDEX.filter(function (movie) {
        return normalize(movie.searchText).indexOf(keyword) !== -1;
      }).slice(0, 80);
      if (!results.length) {
        resultBox.innerHTML = '<p class="empty-state">没有找到匹配影片，请尝试更换关键词。</p>';
        return;
      }
      resultBox.innerHTML = results.map(function (movie) {
        return '<a class="search-result-row" href="' + movie.href + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="search-result-copy">' +
            '<strong>' + escapeHtml(movie.title) + '</strong>' +
            '<p>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</p>' +
          '</span>' +
          '<span>进入详情</span>' +
        '</a>';
      }).join('');
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    if (form && input) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('q', input.value.trim());
        history.replaceState(null, '', nextUrl.toString());
        render(input.value);
      });
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(query);
  }

  function initBasicPlayers() {
    window.setTimeout(function () {
      var players = Array.prototype.slice.call(document.querySelectorAll('[data-static-player]'));
      players.forEach(function (player) {
        if (player.getAttribute('data-player-ready') === 'true') {
          return;
        }
        var video = player.querySelector('video');
        var button = player.querySelector('.player-overlay');
        if (!video || !button) {
          return;
        }
        player.setAttribute('data-player-ready', 'true');
        button.addEventListener('click', function () {
          player.classList.add('is-playing');
          video.play().catch(function () {
            player.classList.remove('is-playing');
          });
        });
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (video.currentTime === 0 || video.ended) {
            player.classList.remove('is-playing');
          }
        });
      });
    }, 400);
  }

  ready(function () {
    initMenu();
    initHeroSlider();
    initListFilters();
    initSearchPage();
    initBasicPlayers();
  });
})();
