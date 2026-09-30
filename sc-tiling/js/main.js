(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isMobile = () => window.innerWidth <= 760;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ============ HEADER: solid on scroll ============ */
  const header = document.getElementById("siteHeader");
  const onHeaderScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 60);
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

  /* ============ SCROLL REVEAL ============ */
  const revealGroups = document.querySelectorAll(".pain-list, .service-grid, .gallery-grid, .why-list");
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
  if (isFinePointer && !prefersReducedMotion) {
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

  galleryItems.forEach(item => item.addEventListener("click", () => openLightbox(item)));
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
  const heroHeight = () => hero.offsetHeight;

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

  /* ============ BEFORE / AFTER SLIDER ============ */
  const baSlider = document.getElementById("baSlider");
  if (baSlider) {
    const baAfter = document.getElementById("baAfter");
    const baHandle = document.getElementById("baHandle");
    const baRange = document.getElementById("baRange");

    let baDragging = false;

    const setBA = (pct) => {
      pct = Math.min(100, Math.max(0, pct));
      baHandle.style.left = pct + "%";
      baRange.value = pct;
      baAfter.style.clipPath = `inset(0 0 0 ${pct}%)`;
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

})();
