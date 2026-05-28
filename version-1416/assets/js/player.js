const Hls = window.Hls;

const players = Array.from(document.querySelectorAll(".js-player"));

players.forEach((shell) => {
  const video = shell.querySelector("video");
  const button = shell.querySelector(".play-overlay");
  const message = shell.querySelector("[data-player-message]");
  const stream = shell.getAttribute("data-stream");
  let hls = null;

  const setMessage = (value) => {
    if (message) {
      message.textContent = value || "";
    }
  };

  const prepare = () => {
    if (!video || !stream) {
      setMessage("播放加载失败");
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setMessage("播放加载中");
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setMessage("正在恢复播放");
          hls.recoverMediaError();
        } else {
          setMessage("播放加载失败");
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    } else {
      setMessage("播放加载失败");
    }
  };

  const start = async () => {
    prepare();
    if (!video) {
      return;
    }
    try {
      await video.play();
      shell.classList.add("is-playing");
      setMessage("");
    } catch (error) {
      setMessage("点击视频继续播放");
    }
  };

  if (button) {
    button.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("play", () => shell.classList.add("is-playing"));
    video.addEventListener("pause", () => shell.classList.remove("is-playing"));
    video.addEventListener("click", () => {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
  }
});
