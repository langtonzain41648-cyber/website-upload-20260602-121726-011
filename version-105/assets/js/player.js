(function () {
  var video = document.getElementById('videoPlayer');
  var playButton = document.getElementById('playButton');
  var source = window.__MOVIE_VIDEO_SOURCE__;
  var hlsCdn = window.__HLS_CDN__;

  if (!video || !source) {
    return;
  }

  function attachNative() {
    video.src = source;
  }

  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = callback;
    script.onerror = attachNative;
    document.head.appendChild(script);
  }

  function initPlayer() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      attachNative();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    if (hlsCdn) {
      loadScript(hlsCdn, function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          attachNative();
        }
      });
    } else {
      attachNative();
    }
  }

  initPlayer();

  if (playButton) {
    playButton.addEventListener('click', function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    });
  }
})();
