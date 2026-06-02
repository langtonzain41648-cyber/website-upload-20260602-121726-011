(function () {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-menu-toggle]');

    function syncHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (toggle && header) {
        toggle.addEventListener('click', function () {
            header.classList.toggle('menu-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = index % slides.length;
            if (current < 0) {
                current = slides.length - 1;
            }
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }
    }

    var filterInput = document.querySelector('[data-local-filter]');
    var filterScope = document.querySelector('[data-filter-scope]');

    function filterCards(value) {
        if (!filterScope) {
            return;
        }
        var keyword = (value || '').trim().toLowerCase();
        var cards = filterScope.querySelectorAll('[data-movie-card]');
        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
        });
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            filterInput.value = query;
            filterCards(query);
        }
        filterInput.addEventListener('input', function () {
            filterCards(filterInput.value);
        });
    }
})();
