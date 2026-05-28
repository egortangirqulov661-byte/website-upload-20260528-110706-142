(function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var input = document.querySelector('#searchInput');
  var summary = document.querySelector('#searchSummary');
  var results = document.querySelector('#searchResults');
  var movies = window.MOVIE_INDEX || [];

  if (input) {
    input.value = query;
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function renderRow(movie) {
    return [
      '<article class="rank-row">',
      '  <a class="rank-poster poster-frame" href="' + movie.url + '">',
      '    <img src="' + movie.poster + '" alt="' + movie.title + '" loading="lazy" data-fallback-title="' + movie.title + '">',
      '  </a>',
      '  <div class="rank-content">',
      '    <h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
      '    <p>' + movie.desc + '</p>',
      '    <div class="rank-tags">',
      '      <span>' + movie.year + '</span>',
      '      <span>' + movie.region + '</span>',
      '      <span>' + movie.category + '</span>',
      '      <span>' + movie.genre + '</span>',
      '    </div>',
      '  </div>',
      '  <a class="row-action" href="' + movie.url + '">查看</a>',
      '</article>'
    ].join('');
  }

  if (!query) {
    if (summary) {
      summary.textContent = '请输入关键词开始搜索。';
    }
    return;
  }

  var words = normalize(query).split(/\s+/).filter(Boolean);
  var matched = movies.filter(function (movie) {
    var haystack = normalize([
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      movie.category,
      movie.tags,
      movie.desc
    ].join(' '));

    return words.every(function (word) {
      return haystack.indexOf(word) !== -1;
    });
  }).slice(0, 120);

  if (summary) {
    summary.textContent = '搜索“' + query + '”，找到 ' + matched.length + ' 条结果。';
  }

  if (results) {
    results.innerHTML = matched.length ? matched.map(renderRow).join('') : '<p>没有找到匹配影片，请更换关键词。</p>';
  }
})();
