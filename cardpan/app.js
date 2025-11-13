// app.js — fixed

/***********************
 * Toast (UI helper)
 ***********************/
function showToast(message = "Kopyalandı") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timeout);
  showToast._timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 1700);
}

/***********************
 * Copy helper
 ***********************/
function copyText(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText || el.textContent || "";
  if (!navigator.clipboard) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand("copy"); showToast("Kopyalandı"); }
    catch { showToast("Kopyalama uğursuz oldu"); }
    document.body.removeChild(textarea);
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => showToast("Kopyalandı"))
    .catch(() => showToast("Kopyalama uğursuz oldu"));
}

/***********************
 * CVV toggle + eye icon
 ***********************/
let cvvVisible = false;
let realCVV = "123"; // will be overwritten by server response

function setEyeIcon(open) {
  const eyeIcon = document.getElementById("eyeIcon");
  if (!eyeIcon) return;
  if (open) {
    // eye open
    eyeIcon.innerHTML = `
      <path d="M8.34129 2.90865C10.0451 2.90865 11.4263 4.30963 11.4263 6.03783C11.4263 7.76603 10.0451 9.16701 8.34129 9.16701C6.63747 9.16701 5.25626 7.76603 5.25626 6.03783C5.25626 4.30963 6.63747 2.90865 8.34129 2.90865ZM8.34129 4.0821C7.27641 4.0821 6.41315 4.95771 6.41315 6.03783C6.41315 7.11795 7.27641 7.99357 8.34129 7.99357C9.40618 7.99357 10.2694 7.11795 10.2694 6.03783C10.2694 4.95771 9.40618 4.0821 8.34129 4.0821ZM8.34129 0.167007C11.8995 0.167007 14.9711 2.63124 15.8234 6.08458C15.9009 6.39892 15.7126 6.71753 15.4027 6.79622C15.0928 6.8749 14.7787 6.68387 14.7011 6.36953C13.977 3.4354 11.3657 1.34045 8.34129 1.34045C5.31559 1.34045 2.70346 3.4372 1.98061 6.37306C1.9032 6.68744 1.58919 6.87865 1.27925 6.80014C0.9693 6.72163 0.780788 6.40312 0.858193 6.08874C1.70896 2.63336 4.78153 0.167007 8.34129 0.167007Z" fill="white"/>
    `;
  } else {
    // eye off (crossed)
    eyeIcon.innerHTML = `
      <line x1="1" y1="1" x2="15" y2="9" stroke="#19c2e5" stroke-width="1.5"/>
      <path d="M8.34129 2.90865C10.0451 2.90865 11.4263 4.30963 11.4263 6.03783C11.4263 7.76603 10.0451 9.16701 8.34129 9.16701C6.63747 9.16701 5.25626 7.76603 5.25626 6.03783C5.25626 4.30963 6.63747 2.90865 8.34129 2.90865ZM8.34129 4.0821C7.27641 4.0821 6.41315 4.95771 6.41315 6.03783C6.41315 7.11795 7.27641 7.99357 8.34129 7.99357C9.40618 7.99357 10.2694 7.11795 10.2694 6.03783C10.2694 4.95771 9.40618 4.0821 8.34129 4.0821ZM8.34129 0.167007C11.8995 0.167007 14.9711 2.63124 15.8234 6.08458C15.9009 6.39892 15.7126 6.71753 15.4027 6.79622C15.0928 6.8749 14.7787 6.68387 14.7011 6.36953C13.977 3.4354 11.3657 1.34045 8.34129 1.34045C5.31559 1.34045 2.70346 3.4372 1.98061 6.37306C1.9032 6.68744 1.58919 6.87865 1.27925 6.80014C0.9693 6.72163 0.780788 6.40312 0.858193 6.08874C1.70896 2.63336 4.78153 0.167007 8.34129 0.167007Z" fill="white"/>
    `;
  }
}

function toggleCVV() {
  cvvVisible = !cvvVisible;
  const cvvLabel = document.getElementById("cvvLabel");
  if (cvvLabel) cvvLabel.textContent = cvvVisible ? realCVV : "CVV";
  setEyeIcon(cvvVisible);
}

/***********************
 * Close card behavior
 ***********************/
function closeCard() {
  const modal = document.querySelector(".credit-card-modal");
  if (modal) modal.style.display = "none";
  window.onbeforeunload = function () { return true; };
}

document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("closeBtn");
  if (closeBtn) {
    closeBtn.onclick = function () {
      if (window.flutter_inappwebview) {
        window.flutter_inappwebview.callHandler("closeWebView");
      } else {
        closeCard();
      }
    };
  }
});

/***********************
 * Populate fields
 ***********************/
function populateCardFields(data) {
  if (!data) return;
  const cardNumberEl = document.getElementById("cardNumber");
  const cardExpiryEl = document.getElementById("cardExpiry");
  const cvvLabelEl = document.getElementById("cvvLabel");
  const cardLogoEl = document.querySelector(".card-logo img");

  // ---- Card number ----
  if (data.cardNumber && cardNumberEl) {
    const digits = String(data.cardNumber).replace(/\D/g, "");
    const grouped = digits.replace(/(.{4})/g, "$1 ").trim();
    cardNumberEl.textContent = grouped || cardNumberEl.textContent;

    // Detect brand from first digit(s)
    if (cardLogoEl) {
      if (digits.startsWith("4")) {
        cardLogoEl.src = "/visa.svg";
        cardLogoEl.alt = "VISA";
      } else if (digits.startsWith("5")) {
        cardLogoEl.src = "/master.svg";
        cardLogoEl.alt = "MasterCard";
      } else {
        cardLogoEl.src = "/card-default.svg"; // optional fallback
        cardLogoEl.alt = "Card";
      }
    }
  }

  // ---- Expiry ----
  const exp = data.expireDate || data.expiry || data.expire || data.expiration;
  if (exp && cardExpiryEl) {
    cardExpiryEl.textContent = String(exp);
  }

  // ---- CVV ----
  if (data.cvv && cvvLabelEl) {
    realCVV = String(data.cvv);
    cvvLabelEl.textContent = cvvVisible ? realCVV : "CVV";
  }
}

/***********************
 * Extract card id from URL
 ***********************/
function extractCardId() {
  const m = window.location.pathname.match(/\/card\/(\d+)/i);
  if (m && m[1]) return m[1];

  const p = new URLSearchParams(window.location.search);
  const q = p.get("id");
  if (q && /^\d+$/.test(q)) return q;

  return null;
}

/***********************
 * Fetch helper with timeout
 ***********************/
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 12000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, { ...rest, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/***********************
 * Fetch card from API
 ***********************/
async function fetchAndPopulateCard() {
  const id = extractCardId();
  if (!id) {
    showToast("Kart ID tapılmadı");
    return;
  }

  const url = `https://cards-pci-api.bankofbaku.com/generate/${id}`;

  try {
    const resp = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 12000
    });

    if (!resp.ok) {
      showToast("Zəhmət olmasa bir qədər sonra yenidən cəhd edəsiniz!");
      return;
    }

    const json = await resp.json(); // { cardNumber, expireDate, cvv }
    populateCardFields(json);
  } catch (err) {
    const msg = String(err && err.message ? err.message : err).toLowerCase();
    if (msg.includes("abort")) {
      showToast("Zəhmət olmasa bir qədər sonra yenidən cəhd edəsiniz!");
    } else if (msg.includes("cors") || msg.includes("access-control")) {
      showToast("CORS xətası — server icazə vermir");
    } else {
      showToast("Şəbəkə xətası — yoxlayın");
    }
  }
}

/***********************
 * Auto-run on load
 ***********************/
document.addEventListener("DOMContentLoaded", function () {
  cvvVisible = false;
  setEyeIcon(false);
  setTimeout(fetchAndPopulateCard, 250);
});

let MY_HEADER_FROM_FLUTTER = null;

function initFlutterHeaderBridge() {
  // Flutter WebView içindəyiksə:
       showToast(MY_HEADER_FROM_FLUTTER);
  if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
    window.flutter_inappwebview
      .callHandler('getHeaderFromFlutter')
      .then(function (result) {
        if (!result) return;
        MY_HEADER_FROM_FLUTTER = result.myHeader || null;
        console.log("Header from Flutter:", MY_HEADER_FROM_FLUTTER);

        // İstəsən:
        showToast(MY_HEADER_FROM_FLUTTER);
      })
      .catch(function (err) {
        console.error("Error getting header from Flutter:", err);
      });
  } else {
    // Flutter yoxdursa, sadəcə logla, qırılmasın
    console.log("flutter_inappwebview not available (normal browser?).");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // sənin mövcud kodların
  showToast("salam");
  cvvVisible = false;
  setEyeIcon(false);
  setTimeout(fetchAndPopulateCard, 250);

  // 🔹 burda Flutter header-ini al
  initFlutterHeaderBridge();
});

/***********************
 * Expose globals (optional)
 ***********************/




window.fetchAndPopulateCard = fetchAndPopulateCard;
window.copyText = copyText;
window.toggleCVV = toggleCVV;
window.closeCard = closeCard;


