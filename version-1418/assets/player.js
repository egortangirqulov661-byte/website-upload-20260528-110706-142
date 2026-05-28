(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function chooseSource(video, hlsUrl, mp4Url) {
    if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      return 'hls';
    }
    if (mp4Url) {
      video.src = mp4Url;
      return 'mp4';
    }
    return 'none';
  }

  function initPlayer(player) {
    if (player.getAttribute('data-player-ready') === 'true') {
      return;
    }
    var video = player.querySelector('video');
    var button = player.querySelector('.player-overlay');
    if (!video || !button) {
      return;
    }
    var hlsUrl = player.getAttribute('data-hls');
    var mp4Url = player.getAttribute('data-mp4');
    var sourceReady = false;

    function prepare() {
      if (sourceReady) {
        return;
      }
      chooseSource(video, hlsUrl, mp4Url);
      sourceReady = true;
    }

    player.setAttribute('data-player-ready', 'true');
    button.addEventListener('click', function () {
      prepare();
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
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-static-player]')).forEach(initPlayer);
  });
})();
