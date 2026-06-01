(function () {
  const CARD_ID = 'card-ip';
  const STYLE_ID = 'visitor-card-style-fix';
  const NOTICE_SELECTOR = '.card-announcement .announcement_content';
  const BROWSER = (() => {
    const ua = navigator.userAgent || '';
    const rules = [
      [/Edg\/([\d.]+)/, 'Microsoft Edge $1'],
      [/Chrome\/([\d.]+)/, 'Chrome $1'],
      [/Firefox\/([\d.]+)/, 'Firefox $1'],
      [/Safari\/([\d.]+)/, 'Safari $1'],
      [/Trident\/.*rv:([\d.]+)/, 'Internet Explorer $1'],
    ];
    for (const [pattern, label] of rules) {
      const match = ua.match(pattern);
      if (match) return label.replace('$1', match[1]);
    }
    return 'Unknown';
  })();

  const log = (...args) => console.log('[visitor-card]', ...args);
  const warn = (...args) => console.warn('[visitor-card]', ...args);
  const error = (...args) => console.error('[visitor-card]', ...args);

  const ensureStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .visitor-card-widget { margin-bottom: 1rem; }
      .visitor-card-widget .visitor-card { padding: 14px 18px 16px; }
      .visitor-card-widget .visitor-card__title.item-headline {
        margin: 0 0 12px; padding: 0; min-height: unset; border-bottom: none;
      }
      .visitor-card-widget .visitor-card__item {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; padding: 9px 0; font-size: 14px; color: var(--font-color);
      }
      .visitor-card-widget .visitor-card__item + .visitor-card__item {
        border-top: 1px dashed var(--card-border-color, rgba(73, 177, 245, 0.16));
      }
      .visitor-card-widget .visitor-card__item span {
        color: var(--font-color); opacity: 0.65; flex: 0 0 auto;
      }
      .visitor-card-widget .visitor-card__item strong {
        font-weight: 600; text-align: right; word-break: break-all;
      }
      @media (max-width: 768px) {
        .visitor-card-widget .visitor-card__item {
          flex-direction: column; align-items: flex-start; gap: 4px;
        }
        .visitor-card-widget .visitor-card__item strong { text-align: left; }
      }
    `;
    document.head.appendChild(style);
    log('style injected');
  };

  const buildCard = ({ ip, location }) => {
    const card = document.createElement('div');
    card.className = 'card-widget visitor-card-widget';
    card.id = CARD_ID;
    card.innerHTML = `
      <div class="item-headline visitor-card__title">
        <i class="fas fa-compass"></i>
        <span>当前访问者</span>
      </div>
      <div class="visitor-card">
        <div class="visitor-card__item"><span>IP</span><strong>${ip || '未知'}</strong></div>
        <div class="visitor-card__item"><span>地区</span><strong>${location || '未知地区'}</strong></div>
        <div class="visitor-card__item"><span>浏览器</span><strong>${BROWSER}</strong></div>
      </div>
    `;
    return card;
  };

  const removeOld = () => {
    const old = document.getElementById(CARD_ID);
    if (old) {
      old.remove();
      log('old card removed');
    }
  };

  const findAuthorCard = () => {
    const selectors = ['.card-widget.card-info', '.card-author', '#aside_content .card-widget'];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        log('author candidate', selector, el);
        return el;
      }
    }
    warn('author card not found');
    return null;
  };

  const insertAfterAuthor = (card) => {
    const author = findAuthorCard();
    if (author && author.parentElement) {
      author.insertAdjacentElement('afterend', card);
      log('inserted after author');
      return true;
    }
    const aside = document.querySelector('#aside_content');
    if (!aside) {
      warn('#aside_content not found');
      return false;
    }
    aside.insertAdjacentElement('afterbegin', card);
    log('inserted at aside begin');
    return true;
  };

  const renderCard = (data) => {
    ensureStyle();
    removeOld();
    const card = buildCard(data);
    const ok = insertAfterAuthor(card);
    log('renderCard done', { ok, exists: !!document.getElementById(CARD_ID) });
  };

  const renderNotice = (text) => {
    const notice = document.querySelector(NOTICE_SELECTOR);
    if (notice) {
      notice.innerHTML = text;
      notice.dataset.visitorInjected = '1';
      log('announcement updated');
    } else {
      warn('announcement content missing');
    }
  };

  const loadData = () => {
    log('loading ip-api');
    fetch('https://ip-api.com/json/?lang=zh-CN', { cache: 'no-store' })
      .then((res) => {
        log('fetch response', res.status, res.ok);
        return res.ok ? res.json() : Promise.reject(res.status);
      })
      .then((data) => {
        log('fetch data', data);
        const location = [data.country, data.regionName, data.city].filter(Boolean).join(' · ');
        renderCard({ ip: data.query, location });
        renderNotice(`欢迎来自 <strong>${location || '未知地区'}</strong> 的朋友，您的 IP 是 <strong>${data.query}</strong>，浏览器是 <strong>${BROWSER}</strong>。`);
      })
      .catch((err) => {
        error('fetch failed', err);
        renderCard({ ip: '', location: '' });
        renderNotice(`欢迎访问本站，浏览器是 <strong>${BROWSER}</strong>。`);
      });
  };

  const boot = () => {
    const aside = document.querySelector('#aside_content');
    const author = findAuthorCard();
    log('boot', { readyState: document.readyState, aside: !!aside, author: !!author, existing: !!document.querySelector(`#${CARD_ID}`) });
    if (!aside) {
      warn('boot aborted: aside not found');
      return;
    }
    if (document.querySelector(`#${CARD_ID}`)) {
      log('card already exists');
      return;
    }
    loadData();
  };

  const waitAndBoot = () => {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      const aside = document.querySelector('#aside_content');
      const author = findAuthorCard();
      log('poll', { tries, aside: !!aside, author: !!author, card: !!document.querySelector(`#${CARD_ID}`) });
      if (aside && author) {
        clearInterval(timer);
        boot();
        return;
      }
      if (tries >= 80) {
        clearInterval(timer);
        warn('poll timeout');
      }
    }, 100);
  };

  const onPjaxComplete = () => {
    log('pjax:complete');
    setTimeout(waitAndBoot, 80);
  };

  const onPjaxSend = () => {
    log('pjax:send');
    removeOld();
  };

  log('script loaded', location.href);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitAndBoot, { once: true });
  } else {
    waitAndBoot();
  }

  document.addEventListener('pjax:complete', onPjaxComplete);
  document.addEventListener('pjax:send', onPjaxSend);
})();
