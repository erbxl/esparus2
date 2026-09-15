(function () {
  "use strict";

  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  const storageKey = "esparus_utm";
  let campaign = {};

  function captureCampaign() {
    // Instagram's in-app browser can block storage. The current page still
    // keeps its campaign in memory, and every WhatsApp link works either way.
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(storageKey) || "{}");
      if (saved && typeof saved === "object") {
        utmKeys.forEach(function (key) {
          if (typeof saved[key] === "string") campaign[key] = saved[key];
        });
      }
    } catch (_) {
      campaign = {};
    }

    const incoming = {};
    const params = new URLSearchParams(window.location.search);
    utmKeys.forEach(function (key) {
      const value = params.get(key);
      if (value) incoming[key] = value;
    });

    if (Object.keys(incoming).length) {
      campaign = incoming;
      try {
        window.sessionStorage.setItem(storageKey, JSON.stringify(campaign));
      } catch (_) {
        // Memory is sufficient when session storage is unavailable.
      }
    }
  }

  function trackEvent(name, detail) {
    const payload = Object.assign({ event: name }, campaign, detail || {});

    // No analytics scripts are loaded here. An existing integration can
    // consume the data layer or subscribe to the public DOM events.
    try {
      if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
    } catch (_) {
      // Tracking must never interrupt navigation.
    }

    try {
      document.dispatchEvent(new CustomEvent("esparus:" + name, { detail: payload }));
    } catch (_) {
      // The page also works in browsers without CustomEvent support.
    }
  }

  function initWhatsAppLinks() {
    document.querySelectorAll("a[data-wa-link]").forEach(function (link) {
      link.addEventListener("click", function () {
        const value = link.getAttribute("data-wa-link") || "unknown";
        const placement = /^[a-z0-9_]+$/.test(value) ? value : "unknown";
        const detail = { placement: placement };
        trackEvent("wa_" + placement + "_click", detail);
        trackEvent("whatsapp_click", detail);
      });
    });
  }

  function initNavigation() {
    const nav = document.querySelector(".site-nav");
    if (!nav) return;

    function updateNavigation() {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    }

    updateNavigation();
    window.addEventListener("scroll", updateNavigation, { passive: true });
  }

  function initWhatsAppDock() {
    const dock = document.querySelector("[data-whatsapp-dock]");
    if (!dock || !("IntersectionObserver" in window)) return;

    const links = document.querySelectorAll('[data-wa-link="hero"], [data-wa-link="final"]');
    if (!links.length) return;

    const visibleLinks = new Set();

    function updateDock() {
      // Preserve keyboard focus if a visible page CTA scrolls into view.
      dock.hidden = visibleLinks.size > 0 && !dock.contains(document.activeElement);
    }

    try {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            visibleLinks.add(entry.target);
          } else {
            visibleLinks.delete(entry.target);
          }
        });
        updateDock();
      }, {
        threshold: [0, 0.5],
        rootMargin: "-80px 0px -24px 0px"
      });

      links.forEach(function (link) { observer.observe(link); });
      dock.addEventListener("focusout", function () {
        // Wait for the next element to receive focus before hiding the dock.
        window.setTimeout(updateDock, 0);
      });
    } catch (_) {
      dock.hidden = false;
    }
  }

  function initFaqTracking() {
    document.querySelectorAll("details[data-faq]").forEach(function (item) {
      let wasOpen = item.open;
      item.addEventListener("toggle", function () {
        if (item.open && !wasOpen) {
          trackEvent("faq_open", { question: item.getAttribute("data-faq") });
        }
        wasOpen = item.open;
      });
    });
  }

  function boot() {
    captureCampaign();
    initWhatsAppLinks();
    initNavigation();
    initWhatsAppDock();
    initFaqTracking();

    document.querySelectorAll("[data-year]").forEach(function (element) {
      element.textContent = String(new Date().getFullYear());
    });

    if (document.body.classList.contains("landing-page")) {
      trackEvent("landing_view");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();