(function () {
  var header = document.querySelector('.site-header');
  var menuToggle = document.querySelector('.menu-toggle');

  if (menuToggle && header) {
    menuToggle.addEventListener('click', function () {
      header.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-missing');
      img.setAttribute('aria-hidden', 'true');
    }, { once: true });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var filterInput = document.querySelector('[data-page-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var grid = document.querySelector('[data-filter-grid]');

  function applyPageFilter() {
    if (!grid) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || ''
      ].join(' ').toLowerCase();
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchYear = !year || card.getAttribute('data-year') === year;
      card.style.display = matchKeyword && matchYear ? '' : 'none';
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyPageFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyPageFilter);
  }

  function cardTemplate(movie) {
    var tags = movie.tags.slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    var line = movie.oneLine || movie.summary || '';
    if (line.length > 110) {
      line = line.slice(0, 110) + '…';
    }

    return [
      '<article class="movie-card">',
      '  <a class="poster-wrap" href="movies/' + movie.id + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-fallback">' + escapeHtml(movie.title.slice(0, 8)) + '</span>',
      '    <span class="poster-badge">' + (movie.year || '近期') + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="movies/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>',
      '    <p class="movie-line">' + escapeHtml(line) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  var globalInput = document.getElementById('globalSearchInput');
  var globalButton = document.getElementById('globalSearchButton');
  var results = document.getElementById('searchResults');
  var stats = document.getElementById('searchStats');

  function getQueryFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
      return '';
    }
  }

  function runGlobalSearch() {
    if (!globalInput || !results || !window.SEARCH_INDEX) {
      return;
    }

    var keyword = globalInput.value.trim().toLowerCase();
    var list = window.SEARCH_INDEX;

    if (keyword) {
      list = list.filter(function (movie) {
        return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags.join(' '), movie.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(keyword) !== -1;
      });
    } else {
      list = list.slice(0, 80);
    }

    results.innerHTML = list.slice(0, 200).map(cardTemplate).join('\n');
    results.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-missing');
      }, { once: true });
    });

    if (stats) {
      stats.textContent = keyword
        ? '关键词“' + globalInput.value.trim() + '”共找到 ' + list.length + ' 部影片，当前展示前 200 部。'
        : '默认展示近期 80 部影片。';
    }
  }

  if (globalInput) {
    var urlQuery = getQueryFromUrl();
    if (urlQuery) {
      globalInput.value = urlQuery;
    }
    globalInput.addEventListener('input', runGlobalSearch);
    globalInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        runGlobalSearch();
      }
    });
  }

  if (globalButton) {
    globalButton.addEventListener('click', runGlobalSearch);
  }

  if (globalInput && window.SEARCH_INDEX) {
    runGlobalSearch();
  }
})();
