(function () {
  var root = document.querySelector("[data-hero-carousel]");
  if (!root) return;

  var slides = root.querySelectorAll("[data-hero-slide]");
  if (!slides.length) return;

  var current = 0;
  var timer = null;
  var intervalMs = 7000;

  function show(index) {
    var n = slides.length;
    current = ((index % n) + n) % n;

    slides.forEach(function (slide, i) {
      var active = i === current;
      slide.classList.toggle("hero-carousel-slide--active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    root.querySelectorAll("[data-hero-tab]").forEach(function (tab) {
      var i = parseInt(tab.getAttribute("data-hero-tab"), 10);
      if (isNaN(i)) return;
      var active = i === current;
      var slideEl = tab.closest(".hero-carousel-slide");
      var inActiveSlide = slideEl && slideEl.classList.contains("hero-carousel-slide--active");
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.setAttribute("tabindex", active && inActiveSlide ? "0" : "-1");
    });
  }

  function next() {
    show(current + 1);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = window.setInterval(next, intervalMs);
  }

  function stopAutoplay() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  root.querySelectorAll("[data-hero-tab]").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var i = parseInt(tab.getAttribute("data-hero-tab"), 10);
      if (isNaN(i)) return;
      show(i);
      stopAutoplay();
      startAutoplay();
    });
  });

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", function (e) {
    if (root.contains(e.target)) stopAutoplay();
  });
  root.addEventListener("focusout", function (e) {
    if (!root.contains(e.relatedTarget)) startAutoplay();
  });

  startAutoplay();
})();
