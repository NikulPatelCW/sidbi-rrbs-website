(function () {
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
    var bankEl = form.elements.namedItem("bank");
    var phoneEl = form.elements.namedItem("phone");
    var emailEl = form.elements.namedItem("email");

    [nameEl, bankEl, phoneEl, emailEl].forEach(function (el) {
      if (el) clearFieldError(el);
    });

    if (nameEl) {
      var name = String(nameEl.value || "").trim();
      if (!name) {
        setFieldError(nameEl, "Please enter your full name.");
        ok = false;
      }
    }

    if (bankEl) {
      var bank = String(bankEl.value || "").trim();
      if (!bank) {
        setFieldError(bankEl, "Please choose your bank.");
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

  function initContactBankCombobox(form) {
    var bankWrap = form.querySelector("#contact-bank-wrap");
    var bankInput = form.querySelector("#contact-bank");
    var trigger = form.querySelector("#contact-bank-trigger");
    var list = form.querySelector("#contact-bank-listbox");
    var label = form.querySelector("#contact-bank-label");
    if (!bankWrap || !bankInput || !trigger || !list || !label) return;

    var options = Array.prototype.slice.call(list.querySelectorAll('[role="option"]'));
    var listOpen = false;
    var activeIdx = -1;

    function setListOpen(isOpen) {
      listOpen = !!isOpen;
      bankWrap.classList.toggle("is-open", listOpen);
      trigger.setAttribute("aria-expanded", listOpen ? "true" : "false");
      list.hidden = !listOpen;
      if (!listOpen) {
        activeIdx = -1;
        trigger.removeAttribute("aria-activedescendant");
        options.forEach(function (opt) {
          opt.classList.remove("contact-combobox-option--active");
        });
      }
    }

    function setActiveIndex(idx) {
      if (idx < 0 || idx >= options.length) {
        activeIdx = -1;
        trigger.removeAttribute("aria-activedescendant");
        options.forEach(function (opt) {
          opt.classList.remove("contact-combobox-option--active");
        });
        return;
      }
      activeIdx = idx;
      options.forEach(function (opt, i) {
        opt.classList.toggle("contact-combobox-option--active", i === idx);
      });
      var act = options[idx];
      if (act && act.id) trigger.setAttribute("aria-activedescendant", act.id);
      if (act && act.scrollIntoView) act.scrollIntoView({ block: "nearest" });
    }

    function selectValue(value, text) {
      bankInput.value = value;
      if (value) {
        label.textContent = text;
        label.classList.remove("contact-combobox-label--placeholder");
      } else {
        label.textContent = "Choose your bank";
        label.classList.add("contact-combobox-label--placeholder");
      }
      options.forEach(function (opt) {
        var v = opt.getAttribute("data-value") || "";
        opt.setAttribute("aria-selected", v === value ? "true" : "false");
      });
      setListOpen(false);
      clearFieldError(bankInput);
    }

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      setListOpen(!listOpen);
      if (listOpen) {
        var current = bankInput.value;
        var startIdx = 0;
        for (var i = 0; i < options.length; i++) {
          if (options[i].getAttribute("data-value") === current) {
            startIdx = i;
            break;
          }
        }
        setActiveIndex(startIdx);
      }
    });

    options.forEach(function (opt) {
      opt.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        var v = opt.getAttribute("data-value") || "";
        selectValue(v, opt.textContent.trim());
      });
    });

    document.addEventListener("click", function (e) {
      if (!listOpen) return;
      if (!bankWrap.contains(e.target)) setListOpen(false);
    });

    trigger.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (listOpen) {
          setListOpen(false);
          e.preventDefault();
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!listOpen) {
          setListOpen(true);
          setActiveIndex(0);
        } else {
          var next = activeIdx < 0 ? 0 : Math.min(options.length - 1, activeIdx + 1);
          setActiveIndex(next);
        }
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!listOpen) {
          setListOpen(true);
          setActiveIndex(options.length - 1);
        } else {
          var prev = activeIdx <= 0 ? 0 : activeIdx - 1;
          setActiveIndex(prev);
        }
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        if (listOpen && activeIdx >= 0) {
          e.preventDefault();
          var chosen = options[activeIdx];
          var val = chosen.getAttribute("data-value") || "";
          selectValue(val, chosen.textContent.trim());
        } else if (!listOpen) {
          e.preventDefault();
          setListOpen(true);
          var cur = bankInput.value;
          var j = 0;
          for (var k = 0; k < options.length; k++) {
            if (options[k].getAttribute("data-value") === cur) {
              j = k;
              break;
            }
          }
          setActiveIndex(j);
        }
        return;
      }
      if (e.key === "Home" && listOpen) {
        e.preventDefault();
        setActiveIndex(0);
      }
      if (e.key === "End" && listOpen) {
        e.preventDefault();
        setActiveIndex(options.length - 1);
      }
      if (e.key === "Tab" && listOpen) {
        setListOpen(false);
      }
    });
  }

  function initContactForm() {
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

    initContactBankCombobox(form);

    form.querySelectorAll("input, textarea, select").forEach(function (el) {
      if (el.id === "contact-phone") return;
      el.addEventListener("input", function () {
        clearFieldError(el);
      });
      if (el.tagName === "SELECT") {
        el.addEventListener("change", function () {
          clearFieldError(el);
        });
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateForm(form)) {
        var firstInvalid = form.querySelector(".contact-input--error");
        if (firstInvalid) {
          if (firstInvalid.id === "contact-bank") {
            var bankTrig = document.getElementById("contact-bank-trigger");
            if (bankTrig) bankTrig.focus();
          } else {
            firstInvalid.focus();
          }
        }
        return;
      }

      var data = {
        fullName: String(form.elements.namedItem("fullName").value || "").trim(),
        bank: String(form.elements.namedItem("bank").value || "").trim(),
        phone: String(form.elements.namedItem("phone").value || "").trim(),
        email: String(form.elements.namedItem("email").value || "").trim(),
        message: String(form.elements.namedItem("message").value || "").trim()
      };
      console.log("Contact form submit", data);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initContactForm();
  });
})();
