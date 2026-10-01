(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isMobile = () => window.innerWidth <= 760;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ============ HEADER: solid on scroll ============ */
  const header = document.getElementById("siteHeader");
  const hasHero = !!document.getElementById("hero");
  const onHeaderScroll = () => {
    header.classList.toggle("scrolled", !hasHero || window.scrollY > 60);
  };
  onHeaderScroll();
  window.addEventListener("scroll", onHeaderScroll, { passive: true });

  /* ============ MOBILE MENU ============ */
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
  const setMenu = (open) => {
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    mobileMenu.classList.toggle("open", open);
    mobileMenuOverlay.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  menuToggle.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
  mobileMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  mobileMenuOverlay.addEventListener("click", () => setMenu(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("open")) setMenu(false);
  });

  /* ============ SCROLL REVEAL ============ */
  const revealGroups = document.querySelectorAll(".pain-list, .service-grid, .gallery-grid, .why-list, .trade-tags");
  revealGroups.forEach(group => {
    Array.from(group.children).forEach((child, i) => {
      if (child.hasAttribute("data-reveal")) child.style.setProperty("--i", i);
    });
  });

  const revealEls = document.querySelectorAll("[data-reveal]");
  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add("in-view"));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ============ CURSOR GLOW (desktop only) ============ */
  const cursorGlow = document.querySelector(".cursor-glow");
  if (cursorGlow && isFinePointer && !prefersReducedMotion) {
    let gx = 0, gy = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => {
      gx = e.clientX; gy = e.clientY;
      cursorGlow.classList.add("active");
    });
    const animateGlow = () => {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      cursorGlow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateGlow);
    };
    animateGlow();
  }

  /* ============ HERO PARALLAX ============ */
  const heroImg = document.getElementById("heroImg");
  const hero = document.getElementById("hero");
  if (!prefersReducedMotion && heroImg) {
    let mx = 0.5, my = 0.5;
    if (isFinePointer) {
      hero.addEventListener("mousemove", (e) => {
        const r = hero.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width;
        my = (e.clientY - r.top) / r.height;
      });
    }
    const renderParallax = () => {
      const scrollShift = Math.min(window.scrollY * 0.35, 160);
      const px = (mx - 0.5) * 26;
      const py = (my - 0.5) * 18;
      heroImg.style.transform = `scale(1.12) translate(${px}px, ${py + scrollShift * 0.28}px)`;
      requestAnimationFrame(renderParallax);
    };
    renderParallax();
  }

  /* ============ TILT CARDS (desktop only) ============ */
  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll(".tilt-card").forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
      });
    });
  }

  /* ============ GALLERY FILTER ============ */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const match = filter === "all" || item.dataset.cat === filter;
        item.classList.toggle("filtered-out", !match);
      });
    });
  });

  /* ============ LIGHTBOX ============ */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let visibleItems = [];
  let currentIndex = 0;

  if (lightbox) {
    const refreshVisibleItems = () => {
      visibleItems = Array.from(galleryItems).filter(item => !item.classList.contains("filtered-out"));
    };

    const openLightbox = (item) => {
      refreshVisibleItems();
      currentIndex = visibleItems.indexOf(item);
      showLightboxImage();
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    };

    const showLightboxImage = () => {
      const item = visibleItems[currentIndex];
      const img = item.querySelector("img");
      const caption = item.querySelector("figcaption");
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = caption ? caption.textContent : "";
    };

    const closeLightbox = () => {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    };

    galleryItems.forEach(item => {
      item.addEventListener("click", () => openLightbox(item));
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
      const caption = item.querySelector("figcaption");
      item.setAttribute("aria-label", `View larger photo: ${caption ? caption.textContent : "gallery image"}`);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(item);
        }
      });
    });
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
    lightboxPrev.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
      showLightboxImage();
    });
    lightboxNext.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % visibleItems.length;
      showLightboxImage();
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev.click();
      if (e.key === "ArrowRight") lightboxNext.click();
    });

    /* swipe support on lightbox for touch */
    let touchStartX = 0;
    lightbox.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) (dx > 0 ? lightboxPrev : lightboxNext).click();
    }, { passive: true });
  }

  /* ============ PROCESS TIMELINE FILL ============ */
  const timeline = document.getElementById("timeline");
  const timelineFill = document.getElementById("timelineFill");
  if (timeline && timelineFill) {
    const updateTimelineFill = () => {
      const r = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = (vh * 0.8 - r.top) / (r.height + vh * 0.3);
      const pct = Math.max(0, Math.min(1, progress)) * 100;
      if (isMobile()) {
        timelineFill.style.height = pct + "%";
      } else {
        timelineFill.style.width = pct + "%";
      }
    };
    updateTimelineFill();
    window.addEventListener("scroll", updateTimelineFill, { passive: true });
    window.addEventListener("resize", updateTimelineFill);
  }

  /* ============ BACK TO TOP + MOBILE CTA BAR ============ */
  const backToTop = document.getElementById("backToTop");
  const mobileCtaBar = document.getElementById("mobileCtaBar");
  const heroHeight = () => (hero ? hero.offsetHeight : 0);

  const onScrollToggles = () => {
    const y = window.scrollY;
    backToTop.classList.toggle("show", y > 700);
    mobileCtaBar.classList.toggle("show", y > heroHeight() * 0.7);
  };
  onScrollToggles();
  window.addEventListener("scroll", onScrollToggles, { passive: true });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ============ CONTACT FORM (front-end only) ============ */
  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      // NOTE: front-end only. Wire this up to a real form backend
      // (Formspree / Netlify Forms / EmailJS) before going live.
      formSuccess.classList.add("show");
      contactForm.reset();
      setTimeout(() => formSuccess.classList.remove("show"), 5000);
    });
  }

  /* ============ BEFORE / AFTER SLIDER ============ */
  const baSlider = document.getElementById("baSlider");
  if (baSlider) {
    const baAfter = document.getElementById("baAfter");
    const baHandle = document.getElementById("baHandle");
    const baRange = document.getElementById("baRange");
    const baTagBefore = document.getElementById("baTagBefore");
    const baTagAfter = document.getElementById("baTagAfter");
    const baFadeZone = 22;

    let baDragging = false;

    const setBA = (pct) => {
      pct = Math.min(100, Math.max(0, pct));
      baHandle.style.left = pct + "%";
      baRange.value = pct;
      baAfter.style.clipPath = `inset(0 0 0 ${pct}%)`;
      baTagBefore.style.opacity = Math.min(1, pct / baFadeZone);
      baTagAfter.style.opacity = Math.min(1, (100 - pct) / baFadeZone);
    };

    const pctFromX = (clientX) => {
      const rect = baSlider.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    };

    baSlider.addEventListener("mousedown", (e) => {
      baDragging = true;
      setBA(pctFromX(e.clientX));
      e.preventDefault();
    });
    window.addEventListener("mousemove", (e) => {
      if (!baDragging) return;
      setBA(pctFromX(e.clientX));
    });
    window.addEventListener("mouseup", () => { baDragging = false; });

    baSlider.addEventListener("touchstart", (e) => {
      baDragging = true;
      setBA(pctFromX(e.touches[0].clientX));
    }, { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (!baDragging) return;
      setBA(pctFromX(e.touches[0].clientX));
    }, { passive: true });
    window.addEventListener("touchend", () => { baDragging = false; });

    baRange.addEventListener("input", (e) => setBA(Number(e.target.value)));

    setBA(50);
  }

  /* ============ TRADE SERVICE MODAL ============ */
  const tradeModal = document.getElementById("tradeModal");
  if (tradeModal) {
    const tradeModalBody = document.getElementById("tradeModalBody");
    const tradeModalClose = document.getElementById("tradeModalClose");
    const tradeTags = document.querySelectorAll(".trade-tag[data-trade]");
    let lastTradeTrigger = null;

    const tradeContent = {
      plumbing: {
        title: "Plumbing",
        intro: "Tiling and plumbing go hand in hand. Every tap, shower valve, and drain needs to be in the right spot before a single tile goes down, so we coordinate directly with our plumber instead of leaving you to manage two separate trades.",
        items: [
          "Moving or adding pipework for a new layout",
          "Shower valves, mixer taps, and heated towel rails",
          "Toilet and basin relocations",
          "Fixing leaks found once old tiles come up"
        ],
        cta: "Ask About Plumbing"
      },
      electrical: {
        title: "Electrical",
        intro: "Bathrooms and kitchens have their own electrical rules. Extractor fans, shaver sockets, and lighting all need to be installed to the right standard, especially near water. Our electrician works alongside us so the wiring is sorted before tiling starts, not patched in afterward.",
        items: [
          "Extractor fans and humidity sensors",
          "Shower electrics and isolator switches",
          "LED niche lighting and spotlights",
          "Socket and switch relocations"
        ],
        cta: "Ask About Electrical"
      },
      carpentry: {
        title: "Carpentry",
        intro: "Floating vanities, boxed-in pipework, built-in storage, and uneven stud walls all need a carpenter before tiling can start cleanly. We bring one in as part of the job instead of leaving you to find someone and coordinate timing yourself.",
        items: [
          "Building and fitting vanity units",
          "Boxing in pipes and cisterns",
          "Timber stud walls for wet rooms",
          "Door and skirting adjustments after a layout change"
        ],
        cta: "Ask About Carpentry"
      },
      painting: {
        title: "Painting",
        intro: "Once the tiling and fittings are in, most bathrooms and kitchens still need the ceiling, woodwork, or an adjoining hallway painted to finish the room off properly. We can bring in a painter at the end of the job so you're not left doing it yourself or booking someone separately.",
        items: [
          "Ceilings and moisture-resistant paint",
          "Woodwork, skirting, and door frames",
          "Touch-ups where new tiling meets existing walls",
          "Adjoining areas affected by the renovation"
        ],
        cta: "Ask About Painting"
      }
    };

    const closeTradeModal = () => {
      tradeModal.classList.remove("open");
      document.body.style.overflow = "";
      if (lastTradeTrigger) lastTradeTrigger.focus();
    };

    const openTradeModal = (tag) => {
      const data = tradeContent[tag.dataset.trade];
      if (!data) return;
      const iconHTML = tag.querySelector(".trade-tag-icon").innerHTML;
      tradeModalBody.innerHTML = `
        <div class="trade-modal-icon">${iconHTML}</div>
        <h3 id="tradeModalTitle">${data.title}</h3>
        <p>${data.intro}</p>
        <ul>${data.items.map(item => `<li>${item}</li>`).join("")}</ul>
        <a href="#contact" class="btn btn-primary btn-wide" id="tradeModalCta">${data.cta}</a>
      `;
      tradeModalBody.scrollTop = 0;
      lastTradeTrigger = tag;
      tradeModal.classList.add("open");
      document.body.style.overflow = "hidden";
      tradeModalClose.focus();
      document.getElementById("tradeModalCta").addEventListener("click", closeTradeModal);
    };

    tradeTags.forEach(tag => {
      tag.addEventListener("click", () => openTradeModal(tag));
      tag.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openTradeModal(tag);
        }
      });
    });

    tradeModalClose.addEventListener("click", closeTradeModal);
    tradeModal.addEventListener("click", (e) => { if (e.target === tradeModal) closeTradeModal(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && tradeModal.classList.contains("open")) closeTradeModal();
    });
  }

  /* ============ COOKIE CONSENT BANNER ============ */
  const cookieBanner = document.getElementById("cookieBanner");
  if (cookieBanner) {
    const COOKIE_KEY = "sct-cookie-choice";
    let storedChoice = null;
    try { storedChoice = localStorage.getItem(COOKIE_KEY); } catch (e) { /* storage unavailable */ }

    if (!storedChoice) {
      setTimeout(() => cookieBanner.classList.add("show"), 900);
    }

    const setChoice = (value) => {
      cookieBanner.classList.remove("show");
      try { localStorage.setItem(COOKIE_KEY, value); } catch (e) { /* storage unavailable */ }
    };

    document.getElementById("cookieAccept")?.addEventListener("click", () => setChoice("accepted"));
    document.getElementById("cookieDecline")?.addEventListener("click", () => setChoice("declined"));
  }

})();
