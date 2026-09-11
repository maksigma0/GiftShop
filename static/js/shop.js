(function () {
  'use strict';

  var AJAX_PATHS = [
    '/wishlist/add/',
    '/wishlist/remove/'
  ];

  function showToast(message) {
    var toast = document.getElementById('shop-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'shop-toast';
      toast.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);' +
        'background:#1B4D2E;color:#fff;padding:12px 20px;border-radius:8px;' +
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
    totalEl.textContent = sum.toFixed(2).replace('.', ',') + ' BYN';
  }

  function handleResponse(path, form, data) {
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

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || form.tagName !== 'FORM') return;

    var path = new URL(form.action, window.location.origin).pathname;
    if (AJAX_PATHS.indexOf(path) === -1) return;

    event.preventDefault();

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
        handleResponse(path, form, data);
        if (button && document.body.contains(button)) button.disabled = false;
      })
      .catch(function () {
        showToast('Ошибка сети. Попробуйте ещё раз.');
        if (button && document.body.contains(button)) button.disabled = false;
      });
  });
})();
