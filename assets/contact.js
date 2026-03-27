(function () {
  var MAP_DEST = "19.060638,72.865349";
  var MAP_SEARCH_URL =
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(MAP_DEST);
  var MAP_DIR_URL =
    "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(MAP_DEST);
  var SHARE_TITLE = "SIDBI — SWAVALAMBAN BHAVAN";
  var SHARE_TEXT =
    "SWAVALAMBAN BHAVAN, Plot No. C-11 G Block Bandra Kurla Complex, Bandra (East), Mumbai - 400051, Maharashtra";
  var CONTACT_EMAIL = "help@sidbirrbcla.in";

  function showToast(el, message) {
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(el._toastTimer);
    el._toastTimer = setTimeout(function () {
      el.hidden = true;
    }, 3500);
  }

  function phoneDigits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function isValidEmail(value) {
    if (!value || !String(value).trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  }

  function clearFieldError(field) {
    if (!field) return;
    var wrap = field.closest(".contact-form-field");
    if (!wrap) return;
    var err = wrap.querySelector(".contact-field-error");
    field.classList.remove("contact-input--error");
    field.setAttribute("aria-invalid", "false");
    if (err) {
      err.textContent = "";
      err.hidden = true;
    }
  }

  function setFieldError(field, message) {
    if (!field) return;
    var wrap = field.closest(".contact-form-field");
    if (!wrap) return;
    var err = wrap.querySelector(".contact-field-error");
    field.classList.add("contact-input--error");
    field.setAttribute("aria-invalid", "true");
    if (err) {
      err.textContent = message;
      err.hidden = false;
    }
  }

  function validateForm(form) {
    var ok = true;
    var nameEl = form.elements.namedItem("fullName");
    var phoneEl = form.elements.namedItem("phone");
    var emailEl = form.elements.namedItem("email");

    [nameEl, phoneEl, emailEl].forEach(function (el) {
      if (el) clearFieldError(el);
    });

    if (nameEl) {
      var name = String(nameEl.value || "").trim();
      if (!name) {
        setFieldError(nameEl, "Please enter your full name.");
        ok = false;
      }
    }

    if (phoneEl) {
      var digits = phoneDigits(phoneEl.value);
      if (!digits.length) {
        setFieldError(phoneEl, "Please enter your phone number.");
        ok = false;
      } else if (digits.length < 10) {
        setFieldError(phoneEl, "Enter a valid phone number (at least 10 digits).");
        ok = false;
      }
    }

    if (emailEl && !isValidEmail(emailEl.value)) {
      setFieldError(emailEl, "Please enter a valid email address.");
      ok = false;
    }

    return ok;
  }

  function initMapActions(toastEl) {
    var dirBtn = document.getElementById("contact-map-directions");
    var shareBtn = document.getElementById("contact-map-share");
    if (dirBtn) {
      dirBtn.addEventListener("click", function () {
        window.open(MAP_DIR_URL, "_blank", "noopener,noreferrer");
      });
    }
    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        var sharePayload = { title: SHARE_TITLE, text: SHARE_TEXT, url: MAP_SEARCH_URL };

        if (navigator.share) {
          navigator.share(sharePayload).catch(function (err) {
            if (err && err.name === "AbortError") return;
            fallbackShare(toastEl);
          });
        } else {
          fallbackShare(toastEl);
        }
      });
    }
  }

  function fallbackShare(toastEl) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(MAP_SEARCH_URL).then(
        function () {
          showToast(toastEl, "Map link copied to clipboard.");
        },
        function () {
          window.open(MAP_SEARCH_URL, "_blank", "noopener,noreferrer");
        }
      );
    } else {
      window.open(MAP_SEARCH_URL, "_blank", "noopener,noreferrer");
    }
  }

  var PHONE_MAX_DIGITS = 15;

  function sanitizePhoneInput(phoneEl) {
    if (!phoneEl) return;
    var digits = phoneDigits(phoneEl.value);
    if (digits.length > PHONE_MAX_DIGITS) {
      digits = digits.slice(0, PHONE_MAX_DIGITS);
    }
    if (phoneEl.value !== digits) {
      var pos = phoneEl.selectionStart;
      phoneEl.value = digits;
      if (pos != null) {
        var nextPos = Math.min(digits.length, pos);
        phoneEl.setSelectionRange(nextPos, nextPos);
      }
    }
  }

  function initContactForm(toastEl) {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var phoneEl = form.querySelector("#contact-phone");
    if (phoneEl) {
      phoneEl.addEventListener("input", function () {
        sanitizePhoneInput(phoneEl);
        clearFieldError(phoneEl);
      });
      phoneEl.addEventListener("paste", function (e) {
        e.preventDefault();
        var text = (e.clipboardData || window.clipboardData).getData("text") || "";
        var pasted = phoneDigits(text);
        var start = phoneEl.selectionStart;
        var end = phoneEl.selectionEnd;
        var merged;
        if (start != null && end != null) {
          var cur = phoneEl.value;
          var before = phoneDigits(cur.slice(0, start));
          var after = phoneDigits(cur.slice(end));
          merged = (before + pasted + after).slice(0, PHONE_MAX_DIGITS);
          phoneEl.value = merged;
          var nextPos = Math.min(before.length + pasted.length, merged.length);
          phoneEl.setSelectionRange(nextPos, nextPos);
        } else {
          merged = pasted.slice(0, PHONE_MAX_DIGITS);
          phoneEl.value = merged;
        }
        clearFieldError(phoneEl);
      });
    }

    form.querySelectorAll("input, textarea").forEach(function (el) {
      if (el.id === "contact-phone") return;
      el.addEventListener("input", function () {
        clearFieldError(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateForm(form)) {
        var firstInvalid = form.querySelector(".contact-input--error");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var fullName = String(form.elements.namedItem("fullName").value || "").trim();
      var phone = String(form.elements.namedItem("phone").value || "").trim();
      var email = String(form.elements.namedItem("email").value || "").trim();
      var subject = String(form.elements.namedItem("subject").value || "").trim();
      var message = String(form.elements.namedItem("message").value || "").trim();

      var subj = subject || "Contact form — SIDBI RRB";
      var body =
        "Name: " +
        fullName +
        "\nPhone: " +
        phone +
        "\nEmail: " +
        (email || "—") +
        "\n\n" +
        (message || "—");

      window.location.href =
        "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toastEl = document.getElementById("contact-toast");
    initMapActions(toastEl);
    initContactForm(toastEl);
  });
})();
