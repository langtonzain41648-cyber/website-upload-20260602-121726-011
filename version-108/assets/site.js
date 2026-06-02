(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function toggleElement(buttonId, targetId) {
    var button = document.getElementById(buttonId);
    var target = document.getElementById(targetId);
    if (!button || !target) {
      return;
    }
    button.addEventListener("click", function () {
      target.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });
    start();
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".page-filter, #global-search"));
    var yearSelects = Array.prototype.slice.call(document.querySelectorAll(".page-select"));
    var genreSelects = Array.prototype.slice.call(document.querySelectorAll(".genre-select"));
    if (!cards.length) {
      return;
    }
    var initial = getQueryValue("q");
    inputs.forEach(function (input) {
      if (initial && !input.value) {
        input.value = initial;
      }
    });
    function selectedValue(list) {
      var found = "";
      list.forEach(function (item) {
        if (item.value) {
          found = item.value;
        }
      });
      return found.toLowerCase();
    }
    function filterCards() {
      var keyword = "";
      inputs.forEach(function (input) {
        if (input.value) {
          keyword = input.value.toLowerCase();
        }
      });
      var year = selectedValue(yearSelects);
      var genre = selectedValue(genreSelects);
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category")
        ].join(" ").toLowerCase();
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okYear = !year || (card.getAttribute("data-year") || "").toLowerCase() === year;
        var okGenre = !genre || (card.getAttribute("data-genre") || "").toLowerCase().indexOf(genre) !== -1;
        var ok = okKeyword && okYear && okGenre;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      var holder = document.querySelector(".all-grid") || document.querySelector(".movie-grid");
      var old = document.querySelector(".no-result");
      if (old) {
        old.remove();
      }
      if (!visible && holder) {
        var empty = document.createElement("div");
        empty.className = "no-result";
        empty.textContent = "没有找到匹配影片";
        holder.appendChild(empty);
      }
    }
    inputs.concat(yearSelects).concat(genreSelects).forEach(function (item) {
      item.addEventListener("input", filterCards);
      item.addEventListener("change", filterCards);
    });
    if (initial) {
      filterCards();
    }
  }

  ready(function () {
    toggleElement("search-toggle", "header-search");
    toggleElement("menu-toggle", "mobile-menu");
    initHero();
    initFilters();
  });
})();

function initMoviePlayer(source) {
  var video = document.getElementById("movie-player");
  var button = document.getElementById("play-button");
  if (!video || !source) {
    return;
  }
  function bindSource() {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }
    video.src = source;
  }
  function play() {
    if (button) {
      button.classList.add("hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        if (button) {
          button.classList.remove("hidden");
        }
      });
    }
  }
  bindSource();
  if (button) {
    button.addEventListener("click", play);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });
  video.addEventListener("play", function () {
    if (button) {
      button.classList.add("hidden");
    }
  });
  video.addEventListener("pause", function () {
    if (button) {
      button.classList.remove("hidden");
    }
  });
}
