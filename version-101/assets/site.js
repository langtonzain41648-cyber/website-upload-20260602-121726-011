(() => {
    const header = document.querySelector(".site-header");
    const menuButton = document.querySelector(".menu-toggle");

    const updateHeader = () => {
        if (!header) {
            return;
        }
        header.classList.toggle("scrolled", window.scrollY > 18);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (menuButton && header) {
        menuButton.addEventListener("click", () => {
            header.classList.toggle("open");
        });
    }

    const carousel = document.querySelector("[data-carousel]");
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
        const dots = Array.from(carousel.querySelectorAll("[data-slide]"));
        let current = 0;

        const showSlide = (index) => {
            current = index;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("active", dotIndex === index);
            });
        };

        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                showSlide(Number(dot.dataset.slide));
            });
        });

        if (slides.length > 1) {
            window.setInterval(() => {
                showSlide((current + 1) % slides.length);
            }, 5200);
        }
    }

    const applyFilters = (root) => {
        const keywordInput = root.querySelector("[data-filter-keyword]");
        const yearSelect = root.querySelector("[data-filter-year]");
        const typeSelect = root.querySelector("[data-filter-type]");
        const list = document.querySelector("[data-card-list]");
        const cards = list ? Array.from(list.querySelectorAll(".movie-card")) : [];

        const run = () => {
            const keyword = (keywordInput?.value || "").trim().toLowerCase();
            const year = yearSelect?.value || "";
            const type = typeSelect?.value || "";

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.type,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.year
                ].join(" ").toLowerCase();
                const passKeyword = !keyword || haystack.includes(keyword);
                const passYear = !year || card.dataset.year === year;
                const passType = !type || card.dataset.type === type;
                card.classList.toggle("is-hidden", !(passKeyword && passYear && passType));
            });
        };

        [keywordInput, yearSelect, typeSelect].forEach((item) => {
            if (item) {
                item.addEventListener("input", run);
                item.addEventListener("change", run);
            }
        });
        run();
    };

    document.querySelectorAll("[data-filter-root]").forEach(applyFilters);

    const playerBox = document.querySelector("[data-player]");
    if (playerBox) {
        const video = playerBox.querySelector("video");
        const startButton = playerBox.querySelector(".player-start");
        let prepared = false;

        const prepare = () => {
            if (!video || prepared) {
                return;
            }
            prepared = true;
            const url = video.getAttribute("data-stream");
            if (!url) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else {
                video.src = url;
            }
        };

        const play = () => {
            prepare();
            playerBox.classList.add("is-playing");
            const attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(() => {
                    playerBox.classList.remove("is-playing");
                });
            }
        };

        if (startButton) {
            startButton.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("play", () => playerBox.classList.add("is-playing"));
            video.addEventListener("pause", () => playerBox.classList.remove("is-playing"));
        }
    }

    const resultsRoot = document.querySelector("#search-results");
    const searchInput = document.querySelector("#search-input");
    if (resultsRoot && Array.isArray(window.movieIndex)) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";
        if (searchInput) {
            searchInput.value = initialQuery;
        }

        const renderCard = (movie) => `
            <article class="video-card movie-card" data-title="${movie.title}" data-year="${movie.year}" data-type="${movie.type}" data-region="${movie.region}" data-genre="${movie.genre}">
                <a class="poster-link" href="${movie.file}" aria-label="${movie.title}">
                    <img src="${movie.cover}" alt="${movie.title}" loading="lazy">
                    <span class="play-badge">▶</span>
                </a>
                <div class="card-body">
                    <div class="card-meta">
                        <span>${movie.type}</span>
                        <span>${movie.year}</span>
                        <span>${movie.region}</span>
                    </div>
                    <h3><a href="${movie.file}">${movie.title}</a></h3>
                    <p>${movie.line}</p>
                    <div class="tag-row">${movie.tags.slice(0, 3).map((tag) => `<span>${tag}</span>`).join("")}</div>
                </div>
            </article>`;

        const runSearch = (value) => {
            const query = (value || "").trim().toLowerCase();
            const pool = window.movieIndex.filter((movie) => {
                const text = [movie.title, movie.region, movie.type, movie.genre, movie.year, movie.tags.join(" ")].join(" ").toLowerCase();
                return !query || text.includes(query);
            }).slice(0, 120);
            resultsRoot.innerHTML = pool.map(renderCard).join("");
        };

        runSearch(initialQuery);
        if (searchInput) {
            searchInput.addEventListener("input", () => runSearch(searchInput.value));
        }
    }
})();
