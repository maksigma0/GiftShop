(function () {
  'use strict';

  var AJAX_PATHS = [
    '/wishlist/add/',
    '/wishlist/remove/'
  ];

  // Карта «ключ history-записи -> позиция скролла» для кнопки «Назад».
  var scrollPositions = {};
  var stateSeq = 0;

  function showToast(message) {
    var toast = document.getElementById('shop-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'shop-toast';
      toast.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);' +
        'background:#9C2542;color:#fff;padding:12px 20px;border-radius:8px;' +
        'font:14px/1.4 Inter,sans-serif;z-index:9999;max-width:90vw;text-align:center;' +
        'box-shadow:0 8px 24px rgba(0,0,0,.25);opacity:0;pointer-events:none;' +
        'transition:opacity .3s ease;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    window.clearTimeout(toast.hideTimer);
    toast.hideTimer = window.setTimeout(function () {
      toast.style.opacity = '0';
    }, 2500);
  }

  function setCount(badgeId, count) {
    var badge = document.getElementById(badgeId);
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? '' : 'none';
  }

  function setWishlistAction(form, inWishlist) {
    var action = form.getAttribute('action') || '';
    var base = action.replace(/\/(add|remove)\/$/, '/');
    form.setAttribute('action', base + (inWishlist ? 'remove/' : 'add/'));
  }

  function updateWishlistButton(form, inWishlist) {
    var button = form.querySelector('button');
    if (!button) return;
    var withText = /избранн/i.test(button.textContent);
    if (inWishlist) {
      button.textContent = withText ? '♥ В избранном' : '♥';
    } else {
      button.textContent = withText ? '♡ В избранное' : '♡';
    }
    button.classList.toggle('active', inWishlist);
  }

  function updateWishlistTotal() {
    var totalEl = document.getElementById('wishlist-total-value');
    if (!totalEl) return;
    var cards = document.querySelectorAll('.wishlist-grid .product-card');
    var sum = 0;
    for (var i = 0; i < cards.length; i++) {
      sum += parseFloat(cards[i].getAttribute('data-price')) || 0;
    }
    totalEl.textContent = sum.toFixed(2).replace('.', ',');
  }

  /* ===================== SPA-навигация ===================== */

  function isInternalURL(url) {
    return url.origin === window.location.origin &&
      url.pathname.indexOf('/admin/') !== 0;
  }

  // Синхронизируем поле поиска в шапке с текущим URL (?q=...).
  function syncSearchInput() {
    var input = document.querySelector('.header-search input[name="q"]');
    if (input) {
      input.value = new URL(window.location.href).searchParams.get('q') || '';
    }
  }

  // Подменяем только <main>, сохраняя шапку и подвал без перерисовки.
  function renderPage(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var nextMain = doc.querySelector('main');
    var currentMain = document.querySelector('main');
    if (nextMain && currentMain) {
      currentMain.innerHTML = nextMain.innerHTML;
    }
    if (doc.title) {
      document.title = doc.title;
    }
    syncSearchInput();
  }

  function navigate(url, push, restoreScroll) {
    fetch(url, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'same-origin'
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        if (push) {
          // Запоминаем позицию скролла текущей записи перед уходом с неё.
          var currentKey = (history.state && history.state.key != null)
            ? history.state.key
            : 0;
          scrollPositions[currentKey] = window.scrollY;

          var key = ++stateSeq;
          history.pushState({ key: key, url: url }, '', url);
        }

        renderPage(html);

        if (restoreScroll) {
          var backKey = (history.state && history.state.key != null)
            ? history.state.key
            : 0;
          window.scrollTo(0, scrollPositions[backKey] || 0);
        } else if (isDetailLike(url)) {
          // При переходе на страницу товара/избранного начинаем сверху.
          window.scrollTo(0, 0);
        } else if (isPaginationURL(url)) {
          // Пагинация: плавно возвращаемся к началу сетки товаров.
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // В остальных случаях (поиск, категории) позицию не трогаем.
      })
      .catch(function () {
        window.location.href = url;
      });
  }

  function isDetailLike(url) {
    var pathname = new URL(url, window.location.href).pathname;
    return pathname.indexOf('/product/') === 0 || pathname.indexOf('/wishlist') === 0;
  }

  function isPaginationURL(url) {
    try {
      return new URL(url, window.location.href).searchParams.has('page');
    } catch (err) {
      return false;
    }
  }

  /* ===================== Обработчики ===================== */

  // Внутренние ссылки.
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var anchor = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!anchor) return;
    if (anchor.target && anchor.target !== '_self') return;
    if (anchor.hasAttribute('download')) return;

    var href = anchor.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;

    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (err) {
      return;
    }

    if (!isInternalURL(url)) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;

    e.preventDefault();
    navigate(url.toString(), true, false);
  });

  // Формы: GET (поиск) — через SPA, POST избранного — «на месте», как у сердечка.
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;

    var action = form.getAttribute('action') || window.location.pathname;
    var path;
    try {
      path = new URL(action, window.location.href).pathname;
    } catch (err) {
      return;
    }

    if (AJAX_PATHS.indexOf(path) !== -1) {
      e.preventDefault();
      handleWishlistSubmit(form, path);
      return;
    }

    var method = (form.getAttribute('method') || 'get').toLowerCase();
    if (method !== 'get') return;

    e.preventDefault();
    var url = new URL(action, window.location.href);
    var params = new URLSearchParams(new FormData(form));
    url.search = params.toString();
    navigate(url.toString(), true, false);
  });

  // Кнопка «Назад» / «Вперёд».
  window.addEventListener('popstate', function () {
    navigate(window.location.href, false, true);
  });

  // Сортировка каталога — через SPA, без перезагрузки страницы.
  document.addEventListener('change', function (e) {
    var select = e.target;
    if (!select || select.id !== 'sort-select') return;

    var url = new URL(window.location.href);
    if (select.value) {
      url.searchParams.set('sort', select.value);
    } else {
      url.searchParams.delete('sort');
    }
    url.searchParams.delete('page');
    navigate(url.toString(), true, false);
  });

  /* ===================== Избранное (сердечко) ===================== */

  function handleWishlistSubmit(form, path) {
    var button = form.querySelector('button[type="submit"]') || form.querySelector('button');
    if (button) button.disabled = true;

    fetch(path, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: new FormData(form),
      credentials: 'same-origin'
    })
      .then(function (response) {
        return response.json()
          .catch(function () { return {}; })
          .then(function (data) { return { status: response.status, data: data }; });
      })
      .then(function (result) {
        var data = result.data || {};
        if (!data.success) {
          showToast(data.error || 'Не удалось выполнить действие');
          if (button && document.body.contains(button)) button.disabled = false;
          return;
        }
        handleWishlistResponse(path, form, data);
        if (button && document.body.contains(button)) button.disabled = false;
      })
      .catch(function () {
        showToast('Ошибка сети. Попробуйте ещё раз.');
        if (button && document.body.contains(button)) button.disabled = false;
      });
  }

  function handleWishlistResponse(path, form, data) {
    if (path === '/wishlist/add/' || path === '/wishlist/remove/') {
      var inWishlist = !!data.in_wishlist;
      setCount('wishlist-count', data.wishlist_count);
      setWishlistAction(form, inWishlist);
      updateWishlistButton(form, inWishlist);
      if (!inWishlist && window.location.pathname.indexOf('/wishlist') === 0) {
        var card = form.closest('.product-card');
        if (card) card.remove();
        if (data.wishlist_count === 0) {
          window.location.reload();
        } else {
          updateWishlistTotal();
        }
      }
    }
  }

  history.scrollRestoration = 'manual';
})();
