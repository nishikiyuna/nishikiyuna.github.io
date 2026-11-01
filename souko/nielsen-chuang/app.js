/* QCQI_Note 共通スクリプト
 *
 * 土台は Review-Templete v2 の app.js。
 * このノート固有の追加・変更は次の3点で、いずれも理由をその場に書いてある。
 *
 *   (1) ページ一覧 PAGES から前後ナビと index.html の目次を生成する
 *   (2) 見出しの自動採番は h2 だけに適用し、番号に § を付ける
 *       （h3 は原書に対応する小節が無いものが多いので採番しない）
 *   (3) KaTeX マクロに量子情報の記法を足す
 *
 * ビルドは不要で、file:// で直接開いても動く。
 */
(() => {
  "use strict";

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  /* ------------------------------------------------------------------ *
   * (1) ページ一覧
   *     章を追加・改名したらここだけ直す。目次・前後ナビ・進捗バッジと、
   *     見出しの採番に使う章番号がすべてここから決まる。
   * ------------------------------------------------------------------ */

  const PAGES = [
    { id: "chapter01", chapter: "1", file: "chapter01.html", part: "Part I — 基礎概念",
      label: "第1章", title: "導入と概観", en: "Introduction and overview", done: true },
    { id: "chapter02", chapter: "2", file: "chapter02.html", part: "Part I — 基礎概念",
      label: "第2章", title: "量子力学入門", en: "Introduction to quantum mechanics", done: true },
    { id: "chapter03", chapter: "3", file: "chapter03.html", part: "Part I — 基礎概念",
      label: "第3章", title: "計算機科学入門", en: "Introduction to computer science", done: true },
    { id: "chapter04", chapter: "4", file: "chapter04.html", part: "Part II — 量子計算",
      label: "第4章", title: "量子回路", en: "Quantum circuits", done: true },
    { id: "chapter05", chapter: "5", file: "chapter05.html", part: "Part II — 量子計算",
      label: "第5章", title: "量子 Fourier 変換とその応用",
      en: "The quantum Fourier transform and its applications", done: true },
    { id: "chapter06", chapter: "6", file: "chapter06.html", part: "Part II — 量子計算",
      label: "第6章", title: "量子探索アルゴリズム", en: "Quantum search algorithms", done: true },
    { id: "chapter07", chapter: "7", file: "chapter07.html", part: "Part II — 量子計算",
      label: "第7章", title: "量子計算機の物理的実現",
      en: "Quantum computers: physical realization", done: true },
    { id: "chapter08", chapter: "8", file: "chapter08.html", part: "Part III — 量子情報",
      label: "第8章", title: "量子ノイズと量子操作",
      en: "Quantum noise and quantum operations", done: true },
    { id: "chapter09", chapter: "9", file: "chapter09.html", part: "Part III — 量子情報",
      label: "第9章", title: "量子情報の距離尺度",
      en: "Distance measures for quantum information", done: true },
    { id: "chapter10", chapter: "10", file: "chapter10.html", part: "Part III — 量子情報",
      label: "第10章", title: "量子誤り訂正", en: "Quantum error-correction", done: true },
    { id: "chapter11", chapter: "11", file: "chapter11.html", part: "Part III — 量子情報",
      label: "第11章", title: "エントロピーと情報", en: "Entropy and information", done: true },
    { id: "chapter12", chapter: "12", file: "chapter12.html", part: "Part III — 量子情報",
      label: "第12章", title: "量子情報理論", en: "Quantum information theory", done: true },
    { id: "appendixA1", chapter: "A1", file: "appendixA1.html", part: "付録",
      label: "付録A1", title: "確率論の基礎", en: "Notes on basic probability theory", done: true },
    { id: "appendixA2", chapter: "A2", file: "appendixA2.html", part: "付録",
      label: "付録A2", title: "群論", en: "Group theory", done: true },
    { id: "appendixA3", chapter: "A3", file: "appendixA3.html", part: "付録",
      label: "付録A3", title: "Solovay–Kitaev の定理", en: "The Solovay–Kitaev theorem", done: true },
    { id: "appendixA4", chapter: "A4", file: "appendixA4.html", part: "付録",
      label: "付録A4", title: "数論", en: "Number theory", done: true },
    { id: "appendixA5", chapter: "A5", file: "appendixA5.html", part: "付録",
      label: "付録A5", title: "公開鍵暗号と RSA",
      en: "Public key cryptography and the RSA cryptosystem", done: true },
    { id: "appendixA6", chapter: "A6", file: "appendixA6.html", part: "付録",
      label: "付録A6", title: "Lieb の定理の証明", en: "Proof of Lieb's theorem", done: true }
  ];

  /* ------------------------------------------------------------------ *
   * 汎用ヘルパー（テンプレート由来）
   * ------------------------------------------------------------------ */

  function slugify(text) {
    return text
      .trim()
      .toLowerCase()
      .replace(/[§#]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}\-_]/gu, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "section";
  }

  function uniqueId(base) {
    let id = base;
    let i = 2;
    while (document.getElementById(id)) id = `${base}-${i++}`;
    return id;
  }

  function makePermalink(id) {
    const link = document.createElement("a");
    link.className = "permalink";
    link.href = `#${id}`;
    link.setAttribute("aria-label", "この位置へのリンク");
    link.title = "この位置へのリンク";
    link.textContent = "#";
    return link;
  }

  /* ------------------------------------------------------------------ *
   * 配色の切り替え（テンプレート由来）
   * ------------------------------------------------------------------ */

  /* file:// で開くとブラウザによっては localStorage が例外を投げる。
   * 配布したノートをダブルクリックで開く使い方を想定しているので、
   * 読み書きは必ずこの2つを通す。保存できない環境ではセッション内だけ覚える。 */
  const THEME_KEY = "qcqi-note-theme";
  let themeFallback = null;

  function readTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || themeFallback || "system";
    } catch (_) {
      return themeFallback || "system";
    }
  }

  function storeTheme(theme) {
    themeFallback = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {
      /* プライベートウインドウや file:// では保存できない。表示は続ける。 */
    }
  }

  function setTheme(theme) {
    if (theme === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    storeTheme(theme);
    updateThemeButton(theme);
  }

  function currentTheme() {
    return readTheme();
  }

  function updateThemeButton(theme) {
    const button = qs("#theme-toggle");
    if (!button) return;
    const labels = { system: "自動", light: "明", dark: "暗" };
    button.textContent = `表示: ${labels[theme]}`;
    button.setAttribute("aria-label", `配色: ${labels[theme]}`);
  }

  function initTheme() {
    setTheme(currentTheme());
    const button = qs("#theme-toggle");
    if (!button) return;
    button.addEventListener("click", () => {
      const order = ["system", "light", "dark"];
      setTheme(order[(order.indexOf(currentTheme()) + 1) % order.length]);
    });
  }

  /* ------------------------------------------------------------------ *
   * (3) KaTeX
   *     マクロ表はここが正本。個別ページで再定義しない。
   * ------------------------------------------------------------------ */

  const KATEX_MACROS = {
    /* テンプレート由来 */
    "\\tr": "\\operatorname{tr}",
    "\\Tr": "\\operatorname{Tr}",
    "\\sgn": "\\operatorname{sgn}",
    "\\diag": "\\operatorname{diag}",
    "\\eps": "\\varepsilon",
    "\\Re": "\\operatorname{Re}",
    "\\Im": "\\operatorname{Im}",
    "\\dd": "\\mathrm{d}",
    "\\ii": "\\mathrm{i}",
    "\\ee": "\\mathrm{e}",
    /* 量子情報の記法（このノート固有） */
    "\\ket": "|#1\\rangle",
    "\\bra": "\\langle #1|",
    "\\braket": "\\langle #1|#2\\rangle",
    "\\ketbra": "|#1\\rangle\\langle #2|",
    "\\proj": "|#1\\rangle\\langle #1|",
    "\\rank": "\\operatorname{rank}",
    "\\supp": "\\operatorname{supp}",
    "\\lcm": "\\operatorname{lcm}",
    "\\ord": "\\operatorname{ord}",
    "\\CNOT": "\\mathrm{CNOT}",
    "\\SWAP": "\\mathrm{SWAP}",
    "\\id": "\\mathbb{1}",
    "\\C": "\\mathbb{C}",
    "\\R": "\\mathbb{R}",
    "\\Z": "\\mathbb{Z}",
    "\\E": "\\mathbb{E}",
    "\\Hilb": "\\mathcal{H}",
    "\\Eop": "\\mathcal{E}"
  };

  function renderMath() {
    if (!window.renderMathInElement) return;
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false }
      ],
      macros: KATEX_MACROS,
      throwOnError: false
    });
  }

  /* ------------------------------------------------------------------ *
   * (2) 見出しの採番と目次
   * ------------------------------------------------------------------ */

  function currentPage() {
    const id = document.body.dataset.page;
    return PAGES.find((page) => page.id === id) || null;
  }

  function chapterNumber() {
    return document.body.dataset.chapter || currentPage()?.chapter || "1";
  }

  /* h2 だけを「§9.1」の形に自動採番する。
   * h3 は採番しない。原書に対応する小節が無い独自の見出しが多く、
   * 機械的に番号を振ると原書に存在しない §4.2.1 のような番号が生まれるためである。
   * 原書に小節がある箇所（§4.5.1 など）は、見出し文の先頭に § 番号を直接書く。 */
  function prepareHeadings() {
    const chapter = chapterNumber();
    let h2Count = 0;

    qsa("main.article h2, main.article h3").forEach((heading) => {
      /* 併記した原書の英語タイトルは番号にも目次にも含めない */
      const enSpan = qs(":scope > .en", heading);
      if (enSpan) enSpan.remove();

      const original = heading.dataset.title || heading.textContent.trim();
      heading.dataset.title = original;
      if (!heading.id) heading.id = uniqueId(slugify(original));

      heading.textContent = "";

      if (heading.tagName === "H2") {
        h2Count += 1;
        const number = `${chapter}.${h2Count}`;
        heading.dataset.sectionNumber = number;

        const numberSpan = document.createElement("span");
        numberSpan.className = "section-number";
        numberSpan.textContent = `§${number} `;
        heading.appendChild(numberSpan);
      }

      const titleSpan = document.createElement("span");
      titleSpan.className = "section-title";
      titleSpan.textContent = original;
      heading.appendChild(titleSpan);

      if (enSpan) heading.appendChild(enSpan);
      heading.appendChild(makePermalink(heading.id));
    });
  }

  function tocLabel(heading) {
    const number = heading.dataset.sectionNumber;
    return number ? `§${number} ${heading.dataset.title}` : heading.dataset.title;
  }

  function buildSectionToc() {
    const sidebar = qs("#sidebar-toc");
    const mobile = qs("#mobile-toc");
    if (!sidebar && !mobile) return;

    const headings = qsa("main.article h2, main.article h3");
    const makeList = () => {
      const ul = document.createElement("ul");
      ul.className = "generated-toc";
      headings.forEach((heading) => {
        const li = document.createElement("li");
        li.className = heading.tagName === "H3" ? "toc-level-3" : "toc-level-2";
        const a = document.createElement("a");
        a.href = `#${heading.id}`;
        a.dataset.target = heading.id;
        a.textContent = tocLabel(heading);
        li.appendChild(a);
        ul.appendChild(li);
      });
      return ul;
    };

    if (sidebar) sidebar.replaceChildren(makeList());
    if (mobile) mobile.replaceChildren(makeList());
  }

  function initScrollSpy() {
    const links = qsa(".generated-toc a[data-target]");
    if (!links.length || !("IntersectionObserver" in window)) return;

    let activeId = null;
    const setActive = (id) => {
      if (!id || id === activeId) return;
      activeId = id;
      links.forEach((link) => link.classList.toggle("active", link.dataset.target === id));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 1] }
    );

    qsa("main.article h2, main.article h3").forEach((heading) => observer.observe(heading));
  }

  /* ------------------------------------------------------------------ *
   * 式とボックスの採番（テンプレート由来）
   * ------------------------------------------------------------------ */

  /* .equation で囲んで id を付けた式だけが採番される。
   * 本文から参照しない式は囲まない、というのがこのノートの方針である。 */
  function numberEquations() {
    const chapter = chapterNumber();
    qsa(".equation[id]").forEach((equation, index) => {
      const number = `${chapter}.${index + 1}`;
      equation.dataset.equationNumber = number;

      let numberLink = qs(":scope > .equation-number", equation);
      if (!numberLink) {
        numberLink = document.createElement("a");
        numberLink.className = "equation-number";
        numberLink.href = `#${equation.id}`;
        numberLink.title = "この式へのリンク";
        equation.appendChild(numberLink);
      }
      numberLink.textContent = `(${number})`;
    });

    qsa("a.eq-ref[href^='#']").forEach((ref) => {
      const target = qs(ref.getAttribute("href"));
      if (target?.dataset.equationNumber) {
        ref.textContent = `式 (${target.dataset.equationNumber})`;
      }
    });
  }

  function numberBoxes() {
    const chapter = chapterNumber();
    const counters = new Map();
    qsa(".numbered-box").forEach((box) => {
      const kind = box.dataset.kind || "box";
      const label = box.dataset.label || "項目";
      const count = (counters.get(kind) || 0) + 1;
      counters.set(kind, count);
      const number = `${chapter}.${count}`;
      box.dataset.boxNumber = number;

      if (!box.id) box.id = uniqueId(`${kind}-${chapter}-${count}`);
      const title = qs(":scope > .box-title", box);
      if (title) {
        const suffix = title.dataset.title ? ` ${title.dataset.title}` : "";
        title.textContent = `${label} ${number}${suffix}`;
        title.appendChild(makePermalink(box.id));
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * copy ボタンと permalink（テンプレート由来）
   * ------------------------------------------------------------------ */

  function initCopyButtons() {
    qsa("pre").forEach((pre) => {
      if (qs(":scope > .copy-code", pre)) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-code";
      button.textContent = "copy";
      button.addEventListener("click", async () => {
        const code = qs("code", pre)?.innerText || pre.innerText;
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = "copied";
          setTimeout(() => (button.textContent = "copy"), 1200);
        } catch (_) {
          button.textContent = "failed";
          setTimeout(() => (button.textContent = "copy"), 1200);
        }
      });
      pre.appendChild(button);
    });
  }

  function initPermalinkCopy() {
    document.addEventListener("click", async (event) => {
      const link = event.target.closest(".permalink");
      if (!link || !navigator.clipboard) return;
      const url = `${location.href.split("#")[0]}${link.getAttribute("href")}`;
      try {
        await navigator.clipboard.writeText(url);
        link.classList.add("copied");
        setTimeout(() => link.classList.remove("copied"), 900);
      } catch (_) {
        /* クリップボードが使えなくても、通常のアンカーとしては機能する */
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * (1) 前後ナビと index.html の目次
   * ------------------------------------------------------------------ */

  function fullTitle(page) {
    return `${page.label} ${page.title}`;
  }

  function buildChapterNav(index) {
    const nav = document.createElement("nav");
    nav.className = "chapter-nav";
    nav.setAttribute("aria-label", "章ナビゲーション");

    const toc = document.createElement("a");
    toc.href = "index.html";
    toc.textContent = "← 目次";
    nav.appendChild(toc);

    const prev = PAGES[index - 1];
    const next = PAGES[index + 1];

    if (prev) {
      const link = document.createElement("a");
      link.href = prev.file;
      link.textContent = `← 前：${fullTitle(prev)}`;
      nav.appendChild(link);
    }
    if (next) {
      const link = document.createElement("a");
      link.href = next.file;
      link.textContent = `次：${fullTitle(next)} →`;
      nav.appendChild(link);
    }
    return nav;
  }

  function buildIndexToc(container) {
    let currentPart = null;
    let list = null;

    PAGES.forEach((page) => {
      if (page.part !== currentPart) {
        currentPart = page.part;
        const heading = document.createElement("p");
        heading.className = "toc-part";
        heading.textContent = currentPart;
        container.appendChild(heading);

        list = document.createElement("ul");
        list.className = "toc-list";
        container.appendChild(list);
      }

      const li = document.createElement("li");

      const status = document.createElement("span");
      status.className = `toc-status ${page.done ? "done" : "pending"}`;
      status.textContent = page.done ? "済" : "未";
      li.appendChild(status);

      if (page.done) {
        const link = document.createElement("a");
        link.href = page.file;
        link.textContent = fullTitle(page);
        li.appendChild(link);
      } else {
        const text = document.createElement("span");
        text.textContent = fullTitle(page);
        li.appendChild(text);
      }

      const en = document.createElement("span");
      en.className = "toc-en";
      en.textContent = page.en;
      li.appendChild(en);

      list.appendChild(li);
    });
  }

  /* ------------------------------------------------------------------ *
   * 起動
   * ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();

    const indexToc = qs("#toc");
    if (indexToc) buildIndexToc(indexToc);

    const article = qs("main.article");
    const page = currentPage();
    if (article && page) {
      prepareHeadings();
      buildSectionToc();
      numberBoxes();
      article.appendChild(buildChapterNav(PAGES.indexOf(page)));
    }

    renderMath();
    numberEquations();
    initScrollSpy();
    initCopyButtons();
    initPermalinkCopy();
  });
})();
