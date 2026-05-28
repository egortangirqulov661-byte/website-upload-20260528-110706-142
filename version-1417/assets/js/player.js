(function () {
  window.initializePlayer = function (streamUrl) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".video-overlay");
    var hlsInstance = null;
    var started = false;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function playVideo() {
      attachStream();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (!started || video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (hlsInstance) {
        hlsInstance.stopLoad();
      }
    });
  };
})();
