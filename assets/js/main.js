(() => {
  "use strict";

  const root = document.documentElement;
  const mobile = window.matchMedia("not all and (min-width: 960px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const weekdays = "日月火水木金土";

  function selectAll(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function webUrl(value, base) {
    if (!value) return "";
    try {
      const { protocol } = new URL(value, base);
      if (protocol === "https:" || protocol === "http:") return value;
      if (protocol === "file:" && base?.startsWith("file:") &&
          !/^[a-z][a-z\d+.-]*:/i.test(value) && !value.startsWith("//")) {
        return value;
      }
    } catch {
      // 無効なURLのときはリンクにしない。
    }
    return "";
  }

  function setExternalLink(link, url) {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    const icon = makeElement("span", "external-icon", "↗");
    icon.setAttribute("aria-hidden", "true");
    link.append(icon, makeElement("span", "visually-hidden", "（新しいタブで開きます）"));
  }

  function arrowIcon() {
    const namespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(namespace, "svg");
    svg.setAttribute("class", "button__arrow");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");

    const path = document.createElementNS(namespace, "path");
    path.setAttribute("d", "M4 12h15m-6-6 6 6-6 6");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.8");
    svg.append(path);
    return svg;
  }

  function todayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function makeDate(date, withWeekday = false) {
    const label = date.replace(/-/g, ".");
    const suffix = withWeekday ? `（${weekdays[new Date(`${date}T00:00:00`).getDay()]}）` : "";
    const time = makeElement("time", "", label + suffix);
    time.dateTime = date;
    return time;
  }

  function renderNews(news) {
    if (!news.length) return;
    const latest = [...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    selectAll('[data-slot="news"]').forEach(slot => {
      const list = makeElement("ul", "news-list");
      latest.forEach(item => {
        const row = makeElement("li", "news-list__item");
        const url = webUrl(item.link, document.baseURI);
        const title = makeElement(url ? "a" : "span", "", item.title);
        const category = makeElement("span", "news-list__category");
        if (item.category === "CLUB") {
          const spanish = makeElement("span", "", item.category);
          spanish.lang = "es";
          category.append(spanish, " ／ クラブ");
        } else {
          category.textContent = item.category;
        }
        if (url) title.setAttribute("href", url);
        row.append(makeDate(item.date), category, title);
        list.append(row);
      });
      slot.replaceChildren(list);
    });
  }

  function renderTrials(trials, today) {
    const upcoming = trials
      .filter(({ date }) => date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));
    if (!upcoming.length) return;

    selectAll('[data-slot="trials"]').forEach(slot => {
      const limit = Number(slot.dataset.trialLimit);
      const list = makeElement("ul", "trial-list");
      const sessions = limit > 0 ? upcoming.slice(0, limit) : upcoming;

      sessions.forEach(session => {
        const row = makeElement("li", "trial-list__item");
        row.append(makeDate(session.date, true));
        [session.time, session.place, session.note].filter(Boolean).forEach(text => {
          row.append(makeElement("span", "", text));
        });
        if (!limit) {
          const link = makeElement("a", "button button--primary");
          link.dataset.form = "trial";
          row.append(link);
        }
        list.append(row);
      });
      slot.replaceChildren(list);
    });
  }

  function renderDeadline(recruitment, today) {
    const { status, season, firstDeadline } = recruitment;
    let message;
    if (status === "full") {
      message = "定員に達しました";
    } else if (status === "closed") {
      message = `${season}年度の募集は終了しました`;
    } else if (firstDeadline && today > firstDeadline) {
      message = "第一次締切は終了しました／引き続き受付中";
    } else if (firstDeadline) {
      const [year, month, day] = firstDeadline.split("-");
      message = `第一次締切 ${year}年${Number(month)}月${Number(day)}日（定員になり次第締切）`;
    }
    if (message) {
      selectAll('[data-slot="deadline"]').forEach(slot => { slot.textContent = message; });
    }
    if (season) selectAll("[data-season]").forEach(slot => { slot.textContent = season; });
  }

  function renderForms(forms, status) {
    const waitlist = "キャンセル待ちのご相談はお問い合わせへ";
    selectAll("[data-form]").forEach(link => {
      const trial = link.dataset.form === "trial";
      if (trial && status === "closed") {
        link.hidden = true;
        return;
      }
      link.removeAttribute("role");
      link.removeAttribute("aria-disabled");

      if (trial && status === "full") {
        link.href = "contacto.html";
        link.replaceChildren(waitlist, arrowIcon());
        return;
      }

      const url = webUrl(forms[link.dataset.form]);
      if (url) {
        link.replaceChildren(trial ? "体験会に申し込む" : "お問い合わせフォームを開く", arrowIcon());
        setExternalLink(link, url);
      } else {
        link.removeAttribute("href");
        link.setAttribute("role", "link");
        link.setAttribute("aria-disabled", "true");
        link.textContent = trial ? "体験会申込フォームは準備中" : "お問い合わせフォームは準備中";
      }
    });

    selectAll("[data-trial-cta]").forEach(link => {
      if (status === "closed") link.hidden = true;
      if (status === "full") {
        link.href = "contacto.html";
        link.replaceChildren(waitlist, arrowIcon());
      }
    });
  }

  function renderInstagram(instagram) {
    const url = webUrl(instagram.url);
    selectAll("[data-if-instagram]").forEach(element => {
      if (url) element.hidden = false;
      else element.remove();
    });
    if (!url) return;

    selectAll("[data-instagram]").forEach(link => {
      const handle = link.querySelector("[data-instagram-handle]");
      if (handle && instagram.handle) {
        handle.textContent = `@${instagram.handle.replace(/^@/, "")}`;
      }
      setExternalLink(link, url);
    });
  }

  function renderEmail(email) {
    if (!email.user || !email.domain) return;

    const address = `${email.user}@${email.domain}`;
    selectAll("[data-email]").forEach(link => {
      link.href = `mailto:${address}`;
      link.textContent = address;
    });

    if (!navigator.clipboard) return;
    selectAll("[data-copy-email]").forEach(button => {
      button.hidden = false;
      const status = document.getElementById(button.getAttribute("aria-controls"));
      button.addEventListener("click", async () => {
        if (status) status.textContent = "";
        try {
          await navigator.clipboard.writeText(address);
          if (status) status.textContent = "コピーしました";
        } catch {
          if (status) status.textContent = "コピーできませんでした。メールアドレスを選択してコピーしてください。";
        }
      });
    });
  }

  function renderData(data) {
    const today = todayKey();
    const { forms = {}, recruitment = {}, news = [], trialSessions = [], instagram = {}, email = {}, venue = {} } = data;

    renderInstagram(instagram);
    renderNews(news);
    renderTrials(trialSessions, today);
    renderDeadline(recruitment, today);
    renderForms(forms, recruitment.status);
    renderEmail(email);

    const mapUrl = webUrl(venue.mapUrl);
    selectAll("[data-map]").forEach(link => {
      link.hidden = !mapUrl;
      if (mapUrl) setExternalLink(link, mapUrl);
    });
    if (venue.name) selectAll("[data-venue]").forEach(slot => { slot.textContent = venue.name; });
  }

  function initHeader(header) {
    const toggle = header.querySelector(".menu-toggle");
    const nav = document.getElementById(toggle.getAttribute("aria-controls"));
    const links = Array.from(nav.querySelectorAll("a[href]"));

    function menuIsOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    function setMenu(open, restoreFocus = false) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      header.classList.toggle("site-header--open", open);
      root.classList.toggle("menu-open", open);
      if (open) links[0].focus();
      if (!open && restoreFocus) toggle.focus();
    }

    function syncMenuMode() {
      if (!mobile.matches && menuIsOpen()) setMenu(false);
      if (!mobile.matches && document.activeElement === toggle) links[0].focus();
      toggle.hidden = !mobile.matches;
      if (mobile.matches && !menuIsOpen() && nav.contains(document.activeElement)) toggle.focus();
    }

    toggle.addEventListener("click", () => setMenu(!menuIsOpen(), true));
    nav.addEventListener("click", event => {
      if (menuIsOpen() && event.target.closest("a[href]")) setMenu(false, true);
    });
    document.addEventListener("keydown", event => {
      if (!menuIsOpen()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setMenu(false, true);
      }
      if (event.key !== "Tab") return;

      const lastLink = links[links.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === toggle) {
        event.preventDefault();
        lastLink.focus();
      } else if ((!event.shiftKey && active === lastLink) || (!nav.contains(active) && active !== toggle)) {
        event.preventDefault();
        toggle.focus();
      }
    });

    function updateHeader() {
      header.classList.toggle("site-header--scrolled", window.scrollY >= 24);
    }

    mobile.addEventListener("change", syncMenuMode);
    window.addEventListener("scroll", updateHeader, { passive: true });
    syncMenuMode();
    updateHeader();
  }

  function initReveal() {
    if (!("IntersectionObserver" in window) || reducedMotion.matches) return;

    function show(element, animate) {
      element.classList.remove("reveal--pending");
      if (animate) element.classList.add("reveal--shown");
      observer.unobserve(element);
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.intersectionRatio >= .15) show(entry.target, true);
      });
    }, { threshold: .15 });

    selectAll(".reveal").forEach(element => {
      if (!element.getClientRects().length || element.getBoundingClientRect().top < window.innerHeight) return;
      element.classList.add("reveal--pending");
      element.addEventListener("focusin", () => show(element, false), { once: true });
      observer.observe(element);
    });
  }

  function initStickyCta(recruitment) {
    const cta = document.querySelector("[data-sticky-cta]");
    if (!cta || recruitment?.status === "closed") return;

    const hero = document.querySelector(".hero");
    const pastHero = () => !hero || hero.getBoundingClientRect().bottom <= 0;

    function update() {
      const visible = mobile.matches && pastHero();
      cta.hidden = !visible;
      root.classList.toggle("has-sticky-cta", visible);
    }

    if (hero) {
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(update);
        observer.observe(hero);
      } else {
        window.addEventListener("scroll", update, { passive: true });
      }
    }
    mobile.addEventListener("change", update);
    update();
  }

  function initPhotoSlots() {
    selectAll(".photo-slot img").forEach(image => {
      const useFallback = () => { image.hidden = true; };
      if (image.complete && !image.naturalWidth) useFallback();
      else image.addEventListener("error", useFallback, { once: true });
    });
  }

  if (window.SITE_DATA) renderData(window.SITE_DATA);
  if (document.querySelector("base")) {
    document.querySelector(".skip-link").href = new URL("#main", window.location.href).href;
  }
  root.classList.replace("no-js", "js");
  const header = document.querySelector(".site-header");
  if (header) initHeader(header);
  initReveal();
  initStickyCta(window.SITE_DATA?.recruitment);
  initPhotoSlots();

  const fonts = document.querySelector("[data-web-fonts]");
  if (fonts) {
    // 初回描画は端末のフォントで始め、Google Fonts のCSSを待たない。
    const applyFonts = () => { fonts.media = "all"; };
    if (fonts.sheet) applyFonts();
    else fonts.addEventListener("load", applyFonts, { once: true });
  }
})();
