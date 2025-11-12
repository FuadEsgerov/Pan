// app.js — drop-in replacement / full script for your page

// ----- UI helper: toast -----
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

// ----- copy text helper -----
function copyText(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText || el.textContent || "";
  if (!navigator.clipboard) {
    // fallback
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); showToast("Kopyalandı"); } catch (e) { showToast("Kopyalama uğursuz oldu"); }
    document.body.removeChild(textarea);
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showToast("Kopyalandı");
  }).catch(() => {
    showToast("Kopyalama uğursuz oldu");
  });
}

// ----- CVV show/hide and icon toggle -----
let cvvVisible = false;
let realCVV = "123"; // default, will be overwritten by server response if available.

function setEyeIcon(open) {
  const eyeIcon = document.getElementById('eyeIcon');
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
  document.getElementById('cvvLabel').textContent = (cvvVisible ? realCVV : "CVV");
  setEyeIcon(cvvVisible);
}

// attach toggle handler on the cvv eye button (safe even if included twice)
document.addEventListener('click', function (e) {
  const t = e.target;
  if (!t) return;
  // look for element with class cvv-eye or the svg inside
  if (t.closest && t.closest('.cvv-eye')) {
    e.preventDefault();
    toggleCVV();
  }
});

// ----- close card behavior -----
function closeCard() {
  const modal = document.querySelector('.credit-card-modal');
  if (modal) modal.style.display = 'none';
  window.onbeforeunload = function(evt) {
    return true;
  };
}

// support for flutter inappwebview handler if present
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById("closeBtn");
  if (closeBtn) {
    closeBtn.onclick = function() {
      if (window.flutter_inappwebview) {
        window.flutter_inappwebview.callHandler('closeWebView');
      } else {
        closeCard();
      }
    };
  }
});

// ----- populate fields safely -----
function populateCardFields(data) {
  // Accept data with keys like cardNumber, expireDate, cvv
  if (!data) return;
  const cardNumberEl = document.getElementById('cardNumber');
  const cardExpiryEl = document.getElementById('cardExpiry');
  const cvvLabelEl = document.getElementById('cvvLabel');

  if (data.cardNumber && cardNumberEl) {
    // Format: optionally split into groups of 4 to match your UI (the UI already shows groups)
    const digits = String(data.cardNumber).replace(/\D/g,'');
    const grouped = digits.replace(/(.{4})/g, '$1 ').trim();
    cardNumberEl.textContent = grouped || cardNumberEl.textContent;
  }

  if ((data.expireDate || data.expiry || data.expire || data.expiration) && cardExpiryEl) {
    const exp = data.expireDate || data.expiry || data.expire || data.expiration;
    cardExpiryEl.textContent = String(exp);
  }

  if (data.cvv && cvvLabelEl) {
    realCVV = String(data.cvv);
    // If CVV is visible currently, show it immediately
    cvvLabelEl.textContent = cvvVisible ? realCVV : "CVV";
  }
}

// ----- fetch card from backend -----
// this function calls the provided API and populates the UI.
async function fetchAndPopulateCard() {
  const url = 'https://cards-pci-api.bankofbaku.com/generate/396296965';
  showToast("Kart alınır..."); // "Fetching card..."
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Add auth headers here if required, e.g. 'Authorization': 'Bearer ...'
      },
      // If backend expects a body, add it here. Example: body: JSON.stringify({ client: 'web' })
      body: null
    });

    if (!resp.ok) {
      // backend returned 4xx/5xx
      console.error('Card API returned non-OK:', resp.status, resp.statusText);
      showToast("Server xətası: Kart alınmadı");
      return;
    }

    // parse json
    const json = await resp.json();
    // Example response: { cardNumber: 5315992149477058, expireDate: "12/25", cvv: "333" }
    populateCardFields(json);
    showToast("Kart uğurla alındı");
  } catch (err) {
    console.error('Error fetching card:', err);
    // Detect possible CORS error hint
    const msg = String(err).toLowerCase();
    if (msg.includes('cors') || msg.includes('access-control')) {
      showToast("CORS xətası — server origin icazə vermir");
      console.warn('If you see a CORS error, your browser blocked the request. You must enable CORS on the server or use a backend proxy.');
    } else {
      showToast("Şəbəkə xətası — yoxlayın");
    }
  }
}

// ----- auto-run on load -----
// Attempt to fetch card automatically when page loads.
// If you prefer to trigger with a button, call fetchAndPopulateCard() from that button instead.
document.addEventListener('DOMContentLoaded', function () {
  // Small delay so UI is already visible
  setTimeout(fetchAndPopulateCard, 250);
});

// Expose function globally (in case you want to call it from console or other script)
window.fetchAndPopulateCard = fetchAndPopulateCard;
window.copyText = copyText;
window.toggleCVV = toggleCVV;
window.closeCard = closeCard;
