(function () {
  var PAGE_BY_FILE = {
    "about.html": "about",
    "contact.html": "contact",
    "faq.html": "faq",
    "index.html": "home",
    "loan-process.html": "loan-process"
  };

  function getCurrentPage() {
    var fileName = window.location.pathname.split("/").pop() || "index.html";
    return PAGE_BY_FILE[fileName] || "";
  }

  function markActiveLinks(root, pageKey) {
    if (!root || !pageKey) return;
    var navKey = pageKey === "home" ? "" : pageKey;
    if (!navKey) return;

    root.querySelectorAll("[data-nav]").forEach(function (node) {
      if (node.getAttribute("data-nav") === navKey) {
        node.classList.add("is-active");
      }
    });
  }

  function initDesktopProductsDropdown(root) {
    var dropdown = root.querySelector(".nav-dropdown");
    if (!dropdown) return;

    var trigger = dropdown.querySelector(".nav-dropdown-trigger");
    if (!trigger) return;
    var closeTimer = null;

    function openMenu() {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      dropdown.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }

    function closeMenu(immediate) {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }

      var closeNow = function () {
        dropdown.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      };

      if (immediate) {
        closeNow();
        return;
      }

      closeTimer = setTimeout(closeNow, 120);
    }

    dropdown.addEventListener("mouseenter", openMenu);
    dropdown.addEventListener("mouseleave", function () {
      closeMenu(false);
    });
    trigger.addEventListener("focus", openMenu);

    document.addEventListener("click", function (e) {
      if (!dropdown.contains(e.target)) {
        closeMenu(true);
      }
    });
  }

  function initMobileProductsAccordion(root) {
    var trigger = root.querySelector(".mobile-products-trigger");
    var list = root.querySelector(".mobile-products-list");
    if (!trigger || !list) return;

    trigger.addEventListener("click", function () {
      var isExpanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", isExpanded ? "false" : "true");
      list.setAttribute("aria-hidden", isExpanded ? "true" : "false");
      list.classList.toggle("is-open", !isExpanded);
    });
  }

  function initMobileDrawer(root) {
    var menuBtn = root.querySelector("#mobileMenuBtn");
    var closeBtn = root.querySelector("#mobileDrawerClose");
    var overlay = root.querySelector("#mobileDrawerOverlay");
    var drawer = root.querySelector("#mobileDrawer");

    if (!menuBtn || !closeBtn || !overlay || !drawer) return;

    function openDrawer() {
      document.body.classList.add("drawer-open");
      drawer.setAttribute("aria-hidden", "false");
    }

    function closeDrawer() {
      document.body.classList.remove("drawer-open");
      drawer.setAttribute("aria-hidden", "true");
    }

    menuBtn.addEventListener("click", openDrawer);
    closeBtn.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);
  }

  function injectPartial(targetId, partialPath) {
    var target = document.getElementById(targetId);
    if (!target) return Promise.resolve(null);

    return fetch(partialPath)
      .then(function (response) {
        if (!response.ok) throw new Error("Could not load partial " + partialPath);
        return response.text();
      })
      .then(function (html) {
        target.innerHTML = html;
        return target;
      })
      .catch(function () {
        return null;
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Promise.all([
      injectPartial("site-header", "./assets/partials/header.html"),
      injectPartial("site-footer", "./assets/partials/footer.html")
    ]).then(function (results) {
      var headerRoot = results[0];
      var currentPage = getCurrentPage();
      if (headerRoot) {
        markActiveLinks(headerRoot, currentPage);
        initDesktopProductsDropdown(headerRoot);
        initMobileProductsAccordion(headerRoot);
        initMobileDrawer(headerRoot);
      }
    });
  });
})();
