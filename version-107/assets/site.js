(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = qs('[data-menu-toggle]');
        var menu = qs('[data-mobile-nav]');
        if (!toggle || !menu) return;
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHero() {
        var slides = qsa('[data-hero-slide]');
        var dots = qsa('[data-hero-dot]');
        if (slides.length < 2) return;
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function applyFilter(scope, keyword, region) {
        var cards = qsa('[data-card]', scope);
        var empty = qs('[data-empty-state]', scope);
        var key = normalize(keyword);
        var reg = normalize(region);
        var visible = 0;
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var itemRegion = normalize(card.getAttribute('data-region'));
            var matchKeyword = !key || text.indexOf(key) !== -1;
            var matchRegion = !reg || itemRegion === reg;
            var show = matchKeyword && matchRegion;
            card.style.display = show ? '' : 'none';
            if (show) visible += 1;
        });
        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    function setupFilters() {
        qsa('[data-filter-scope]').forEach(function (scope) {
            var input = qs('[data-filter-input]', document);
            var localInput = qs('[data-filter-input]', scope) || input;
            var form = qs('[data-filter-form]', document) || qs('[data-search-page-form]', document);
            var region = qs('[data-region-select]', document);
            var params = new URLSearchParams(window.location.search);
            var initial = params.get('q') || '';
            if (localInput && initial) {
                localInput.value = initial;
            }
            function run() {
                applyFilter(scope, localInput ? localInput.value : '', region ? region.value : '');
            }
            if (form) {
                form.addEventListener('submit', function (event) {
                    event.preventDefault();
                    run();
                });
            }
            if (localInput) {
                localInput.addEventListener('input', run);
            }
            if (region) {
                region.addEventListener('change', run);
            }
            if (initial) run();
        });
    }

    function setupPlayers() {
        qsa('.player-shell').forEach(function (box) {
            var video = qs('video', box);
            var button = qs('.player-button', box);
            var state = qs('[data-player-state]', box);
            var url = box.getAttribute('data-video');
            var ready = false;
            var hlsInstance = null;
            function setState(text) {
                if (state) state.textContent = text || '';
            }
            function start() {
                if (!video || !url) return;
                if (!ready) {
                    setState('正在加载');
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(url);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                            setState('');
                        });
                        hlsInstance.on(window.Hls.Events.ERROR, function () {
                            setState('播放暂时不可用');
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = url;
                        video.addEventListener('loadedmetadata', function () {
                            video.play().catch(function () {});
                            setState('');
                        }, { once: true });
                    } else {
                        video.src = url;
                        video.play().catch(function () {
                            setState('播放暂时不可用');
                        });
                    }
                    ready = true;
                } else {
                    video.play().catch(function () {});
                }
                if (button) button.classList.add('hidden');
            }
            if (button) {
                button.addEventListener('click', start);
            }
            if (video) {
                video.addEventListener('play', function () {
                    if (button) button.classList.add('hidden');
                });
            }
            window.addEventListener('pagehide', function () {
                if (hlsInstance) hlsInstance.destroy();
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
