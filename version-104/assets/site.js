(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".nav-links");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("open");
            button.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function setupSlides() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".spotlight-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".spotlight-dot"));
        if (!slides.length || !dots.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("active", idx === current);
            });
        }

        function start() {
            stop();
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
            }
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                show(idx);
                start();
            });
        });

        show(0);
        start();
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        if (!inputs.length) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var categorySelect = document.querySelector("[data-category-filter]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var empty = document.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (initialQuery && inputs[0] && !inputs[0].value) {
            inputs[0].value = initialQuery;
        }

        function apply() {
            var query = normalize(inputs.map(function (input) {
                return input.value;
            }).filter(Boolean).join(" "));
            var category = categorySelect ? normalize(categorySelect.value) : "";
            var year = yearSelect ? normalize(yearSelect.value) : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardCategory = normalize(card.getAttribute("data-category"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (category && cardCategory !== category) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("active", visible === 0);
            }
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", apply);
        });
        if (categorySelect) {
            categorySelect.addEventListener("change", apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", apply);
        }
        apply();
    }

    ready(function () {
        setupMenu();
        setupSlides();
        setupFilters();
    });

    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector(".movie-video");
        var cover = document.querySelector(".player-cover");
        var started = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function begin() {
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;

            if (cover) {
                cover.classList.add("is-hidden");
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = streamUrl;
            video.play().catch(function () {});
        }

        if (cover) {
            cover.addEventListener("click", begin);
        }

        video.addEventListener("click", function () {
            if (!started || video.paused) {
                begin();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
