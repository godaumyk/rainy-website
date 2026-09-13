/* ====== CONFIG — edit this before going live ====== */
const CONFIG = {
  // PromptPay phone number (no dashes or spaces).
  PROMPTPAY_ID: "0817350310",
};

/* ====== Mobile nav toggle ====== */
const navToggle = document.getElementById("navToggle");
const menu = document.getElementById("menu");
navToggle?.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen);
});
menu?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => menu.classList.remove("open"));
});

/* ====== Gallery: auto-paginate into groups of 6, with arrows + dots ======
   Add any number of .gallery-item buttons inside #galleryTrack in
   Rainy.html — this script automatically splits them into scrollable
   pages of 6 (2 rows x 3 columns each) and builds the prev/next arrows
   and dot indicators to match. You don't need to edit this file when
   you add more photos. */
const galleryTrack = document.getElementById("galleryTrack");
const galleryPrev = document.getElementById("galleryPrev");
const galleryNext = document.getElementById("galleryNext");
const galleryDots = document.getElementById("galleryDots");

if (galleryTrack) {
  const ITEMS_PER_PAGE = 6;
  const items = Array.from(galleryTrack.querySelectorAll(".gallery-item"));
  const pageCount = Math.ceil(items.length / ITEMS_PER_PAGE);

  // Group the flat list of items into page wrapper divs.
  galleryTrack.innerHTML = "";
  for (let p = 0; p < pageCount; p++) {
    const page = document.createElement("div");
    page.className = "gallery-page";
    items.slice(p * ITEMS_PER_PAGE, p * ITEMS_PER_PAGE + ITEMS_PER_PAGE)
      .forEach(item => page.appendChild(item));
    galleryTrack.appendChild(page);
  }

  // Build one dot per page.
  const dots = [];
  for (let p = 0; p < pageCount; p++) {
    const dot = document.createElement("button");
    dot.className = "gallery-dot" + (p === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Go to gallery page ${p + 1}`);
    dot.addEventListener("click", () => scrollToPage(p));
    galleryDots.appendChild(dot);
    dots.push(dot);
  }

  function scrollToPage(pageIndex) {
    const target = galleryTrack.children[pageIndex];
    if (target) target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function currentPageIndex() {
    return Math.round(galleryTrack.scrollLeft / galleryTrack.clientWidth);
  }

  function updateControls() {
    const current = currentPageIndex();
    dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
    if (galleryPrev) galleryPrev.disabled = current === 0;
    if (galleryNext) galleryNext.disabled = current === pageCount - 1;
  }

  galleryPrev?.addEventListener("click", () => scrollToPage(Math.max(0, currentPageIndex() - 1)));
  galleryNext?.addEventListener("click", () => scrollToPage(Math.min(pageCount - 1, currentPageIndex() + 1)));
  galleryTrack.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateControls);
  });
  updateControls();

  // If there's only one page, hide the nav controls — nothing to scroll to.
  if (pageCount <= 1) {
    galleryPrev?.classList.add("hidden");
    galleryNext?.classList.add("hidden");
    galleryDots.classList.add("hidden");
  }
}

/* ====== Gallery lightbox ====== */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

document.querySelectorAll(".gallery-item").forEach(item => {
  item.addEventListener("click", () => {
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector("img").alt;
    lightbox.classList.add("open");
  });
});
function closeLightbox() { lightbox.classList.remove("open"); lightboxImg.src = ""; }
lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

/* ====== PromptPay QR (generated dynamically) ======
   Uses promptpay.io — a free public QR generator — built from
   CONFIG.PROMPTPAY_ID and the selected amount. The page needs an
   internet connection when it loads for the QR image to appear,
   since it's fetched live from promptpay.io rather than stored
   as a file in this folder. */
const qrImage = document.getElementById("qrImage");
const qrAmountLabel = document.getElementById("qrAmountLabel");
const amountPicker = document.getElementById("amountPicker");
const customInput = document.getElementById("customAmount");

function updateQR(amount) {
  const safeAmount = Number(amount) > 0 ? Number(amount) : 50;
  qrImage.src = `https://promptpay.io/${CONFIG.PROMPTPAY_ID}/${safeAmount}.png`;
  qrAmountLabel.textContent = `฿${safeAmount.toLocaleString("en-US")}`;
}
updateQR(50);

amountPicker?.addEventListener("click", (e) => {
  const btn = e.target.closest(".amount-btn");
  if (!btn) return;
  amountPicker.querySelectorAll(".amount-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  if (btn.dataset.amount === "custom") {
    customInput.classList.remove("hidden");
    customInput.focus();
  } else {
    customInput.classList.add("hidden");
    updateQR(btn.dataset.amount);
  }
});
customInput?.addEventListener("input", () => {
  if (customInput.value) updateQR(customInput.value);
});

/* ====== Guestbook form (Formspree) ======
   Sign up for free at formspree.io, then replace "YOUR_FORM_ID" in
   Rainy.html (action="https://formspree.io/f/YOUR_FORM_ID") with your
   real form ID. Submitted messages go to the owner's email — they do
   NOT appear on the page automatically. The owner has to manually copy
   the ones they like into the .messages-wall section in Rainy.html. */
const guestbookForm = document.getElementById("guestbookForm");
const formStatus = document.getElementById("formStatus");

guestbookForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(guestbookForm);
  formStatus.textContent = "Sending...";
  try {
    const res = await fetch(guestbookForm.action, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" },
    });
    if (res.ok) {
      formStatus.textContent = "Message sent — thank you! 🐾";
      guestbookForm.reset();
    } else {
      formStatus.textContent = "Something went wrong. Please try again, or message us on LINE instead.";
    }
  } catch (err) {
    formStatus.textContent = "Something went wrong. Please try again, or message us on LINE instead.";
  }
});