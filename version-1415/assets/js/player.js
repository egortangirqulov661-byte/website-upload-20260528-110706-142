import { H as Hls } from './hls-dru42stk.js';

function loadHlsVideo(player) {
  var video = player.querySelector('video');
  var source = player.getAttribute('data-src');

  if (!video || !source) {
    return;
  }

  if (video.dataset.ready === 'true') {
    video.play().catch(function () {});
    return;
  }

  if (Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.dataset.ready = 'true';
      video.play().catch(function () {});
    });
    hls.on(Hls.Events.ERROR, function (_event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.dataset.ready = 'true';
    video.play().catch(function () {});
  } else {
    player.classList.add('is-error');
    var button = player.querySelector('.player-start');
    if (button) {
      button.innerHTML = '<strong>当前浏览器不支持 HLS 播放</strong>';
    }
  }
}

document.querySelectorAll('.static-hls-player').forEach(function (player) {
  var button = player.querySelector('.player-start');

  if (button) {
    button.addEventListener('click', function () {
      player.classList.add('is-playing');
      loadHlsVideo(player);
    });
  }
});
