/* ==========================================================================
   Moonlight Studio & Photography
   review.js  –  Firestore-only review logic
   Firebase compat v9 SDKs are loaded in review.html before this file.
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   1. FIREBASE INIT
   -------------------------------------------------------------------------- */
const firebaseConfig = {
    apiKey:            "AIzaSyDqndsmqw6d4DBBtBGDqBMc7PcQtesQgqc",
    authDomain:        "moonlightstudio-397e6.firebaseapp.com",
    projectId:         "moonlightstudio-397e6",
    storageBucket:     "moonlightstudio-397e6.firebasestorage.app",
    messagingSenderId: "953199804664",
    appId:             "1:953199804664:web:ae05823452f150514f7b0d",
    measurementId:     "G-8PDBF1Z6T8"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db      = firebase.firestore();
const storage = firebase.storage();

/* --------------------------------------------------------------------------
   2. DOM REFERENCES
   -------------------------------------------------------------------------- */
const reviewForm           = document.getElementById('review-submit-form');
const reviewNameInput      = document.getElementById('review-name');
const reviewEmailInput     = document.getElementById('review-email');
const reviewPhoneInput     = document.getElementById('review-phone');        // ← fixed (was reviewPhotoInput)
const reviewEventType      = document.getElementById('review-event-type');
const reviewRatingInput    = document.getElementById('review-rating-val');
const reviewMessageInput   = document.getElementById('review-message');
const reviewPhotoInput     = document.getElementById('review-photo-input');
const reviewSuccessOverlay = document.getElementById('review-success-banner');
const reviewSuccessClose   = document.getElementById('review-success-close-btn');
const reviewSubmitBtn      = document.getElementById('review-submit-btn');
const reviewsFeed          = document.getElementById('reviews-feed-container');

const fileChosenText       = document.getElementById('file-chosen-text');
const filePreviewContainer = document.getElementById('file-preview-container');
const filePreviewImg       = document.getElementById('file-preview-img');
const removePreviewBtn     = document.getElementById('remove-preview-btn-el');

const scrollBar            = document.getElementById('scroll-progress-bar');

/* --------------------------------------------------------------------------
   3. PHOTO UPLOAD STATE
   -------------------------------------------------------------------------- */
let selectedPhotoFile = null;    // File object (or null)

/* --------------------------------------------------------------------------
   4. UTILITIES
   -------------------------------------------------------------------------- */
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

/**
 * Validates a single form field and toggles the .error class on its parent.
 * @param {HTMLElement} input
 * @param {Function|null} [validationFn]
 * @returns {boolean}
 */
function checkField(input, validationFn) {
    const parent  = input.closest('.form-group');
    const isValid = validationFn
        ? validationFn(input.value.trim())
        : input.value.trim() !== '';
    if (parent) parent.classList.toggle('error', !isValid);
    return isValid;
}

/* --------------------------------------------------------------------------
   5. SCROLL PROGRESS BAR
   -------------------------------------------------------------------------- */
window.addEventListener('scroll', () => {
    const winH = document.documentElement.scrollHeight - window.innerHeight;
    if (winH > 0 && scrollBar) {
        scrollBar.style.width = ((window.scrollY / winH) * 100) + '%';
    }
});

/* --------------------------------------------------------------------------
   6. STAR RATING INTERACTION
   -------------------------------------------------------------------------- */
const starButtons = document.querySelectorAll('.rating-star-btn');

starButtons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        highlightStars(parseInt(btn.dataset.starVal), 'hover-star');
    });
    btn.addEventListener('mouseleave', resetStarsHighlight);
    btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.starVal);
        reviewRatingInput.value = val;
        const parent = reviewRatingInput.closest('.form-group');
        if (parent) parent.classList.remove('error');
        highlightStars(val, 'active-star');
    });
});

function highlightStars(rating, className) {
    starButtons.forEach(btn => {
        const v    = parseInt(btn.dataset.starVal);
        const icon = btn.querySelector('i');
        if (v <= rating) {
            btn.classList.add(className);
            if (icon) icon.classList.replace('fa-regular', 'fa-solid');
        } else {
            if (className === 'active-star') {
                btn.classList.remove('active-star');
                if (icon) icon.classList.replace('fa-solid', 'fa-regular');
            } else {
                btn.classList.remove('hover-star');
            }
        }
    });
}

function resetStarsHighlight() {
    const active = parseInt(reviewRatingInput.value) || 0;
    starButtons.forEach(btn => {
        const v    = parseInt(btn.dataset.starVal);
        const icon = btn.querySelector('i');
        btn.classList.remove('hover-star');
        if (v <= active) {
            btn.classList.add('active-star');
            if (icon) icon.classList.replace('fa-regular', 'fa-solid');
        } else {
            btn.classList.remove('active-star');
            if (icon) icon.classList.replace('fa-solid', 'fa-regular');
        }
    });
}

/* --------------------------------------------------------------------------
   7. FILE UPLOAD / PREVIEW
   -------------------------------------------------------------------------- */
if (reviewPhotoInput) {
    reviewPhotoInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) { clearPhotoSelection(); return; }

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (PNG, JPG, WEBP).');
            clearPhotoSelection();
            return;
        }

        selectedPhotoFile          = file;
        fileChosenText.textContent = file.name;

        const reader = new FileReader();
        reader.onload = evt => {
            filePreviewImg.src                 = evt.target.result;
            filePreviewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

if (removePreviewBtn) {
    removePreviewBtn.addEventListener('click', clearPhotoSelection);
}

function clearPhotoSelection() {
    selectedPhotoFile                  = null;
    reviewPhotoInput.value             = '';
    fileChosenText.textContent         = 'Choose Image...';
    filePreviewContainer.style.display = 'none';
    filePreviewImg.src                 = '';
}

/* --------------------------------------------------------------------------
   8. INLINE ERROR CLEARING
   -------------------------------------------------------------------------- */
[reviewNameInput, reviewEmailInput, reviewPhoneInput, reviewEventType, reviewMessageInput]
    .forEach(el => {
        if (!el) return;
        ['input', 'change'].forEach(evt => {
            el.addEventListener(evt, () => {
                const p = el.closest('.form-group');
                if (p) p.classList.remove('error');
            });
        });
    });

/* Floating label for select */
if (reviewEventType) {
    reviewEventType.addEventListener('change', () => {
        reviewEventType.classList.toggle('has-value', !!reviewEventType.value);
    });
}

/* --------------------------------------------------------------------------
   9. STATISTICS  (calculated purely from Firestore data)
   -------------------------------------------------------------------------- */
function compileStatistics(reviews) {
    const total  = reviews.length;
    const avgEl  = document.getElementById('stats-avg-val');
    const cntEl  = document.getElementById('stats-count-val');
    const starEl = document.getElementById('stats-stars-box');

    if (total === 0) {
        if (avgEl)  avgEl.textContent  = '0.0';
        if (cntEl)  cntEl.textContent  = 'Based on 0 reviews';
        if (starEl) {
            starEl.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                starEl.innerHTML += '<i class="fa-regular fa-star text-gold"></i>';
            }
        }
        for (let s = 5; s >= 1; s--) {
            const fill  = document.getElementById(`bar-${s}-fill`);
            const label = document.getElementById(`bar-${s}-count`);
            if (fill)  fill.style.width  = '0%';
            if (label) label.textContent = '0%';
        }
        return;
    }

    let sum = 0;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(rev => {
        const r = Math.min(5, Math.max(1, parseInt(rev.rating) || 5));
        sum += r;
        counts[r]++;
    });

    const avg        = sum / total;
    const roundedAvg = Math.round(avg * 2) / 2;

    if (avgEl)  avgEl.textContent  = avg.toFixed(1);
    if (cntEl)  cntEl.textContent  = `Based on ${total} review${total === 1 ? '' : 's'}`;

    if (starEl) {
        starEl.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= roundedAvg) {
                starEl.innerHTML += '<i class="fa-solid fa-star text-gold"></i>';
            } else if (i - 0.5 === roundedAvg) {
                starEl.innerHTML += '<i class="fa-solid fa-star-half-stroke text-gold"></i>';
            } else {
                starEl.innerHTML += '<i class="fa-regular fa-star text-gold"></i>';
            }
        }
    }

    for (let s = 5; s >= 1; s--) {
        const pct   = Math.round((counts[s] / total) * 100);
        const fill  = document.getElementById(`bar-${s}-fill`);
        const label = document.getElementById(`bar-${s}-count`);
        if (fill)  fill.style.width  = `${pct}%`;
        if (label) label.textContent = `${pct}%`;
    }
}

/* --------------------------------------------------------------------------
   10. RENDER REVIEW CARDS
   -------------------------------------------------------------------------- */
function renderReviews(reviews) {
    if (!reviewsFeed) return;

    if (!reviews || reviews.length === 0) {
        reviewsFeed.innerHTML = `
            <div style="text-align:center;padding:50px 20px;border:1px dashed rgba(255,255,255,0.04);">
                <i class="fa-regular fa-comment-dots"
                   style="font-size:2rem;color:var(--accent-gold);display:block;margin-bottom:15px;"></i>
                <p style="font-weight:300;">No testimonials published yet.</p>
                <p style="font-size:0.8rem;color:#777;margin-top:5px;">
                    Be the first to share your creative experience with Moonlight Studio.
                </p>
            </div>`;
        compileStatistics([]);
        return;
    }

    reviewsFeed.innerHTML = '';

    reviews.forEach((rev, idx) => {
        /* Timestamp: Firestore Timestamp objects expose .toDate() */
        let formattedDate = '';
        if (rev.timestamp) {
            const d = rev.timestamp.toDate ? rev.timestamp.toDate() : new Date(rev.timestamp);
            if (!isNaN(d)) {
                formattedDate = d.toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                });
            }
        }

        /* Stars HTML */
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += i <= rev.rating
                ? '<i class="fa-solid fa-star text-gold" style="font-size:0.8rem;"></i>'
                : '<i class="fa-regular fa-star text-gold" style="font-size:0.8rem;"></i>';
        }

        /* Avatar HTML */
        let avatarHtml = '';
        if (rev.photoUrl) {
            avatarHtml = `<img src="${escapeHTML(rev.photoUrl)}"
                               alt="${escapeHTML(rev.name)}"
                               class="reviewer-avatar">`;
        } else {
            const initials = (rev.name || 'U')
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();
            avatarHtml = `<div class="reviewer-avatar-placeholder">${initials}</div>`;
        }

        const card = document.createElement('div');
        card.className          = 'review-card';
        card.style.animationDelay = `${idx * 0.07}s`;
        card.innerHTML = `
            <div class="review-card-header">
                <div class="reviewer-profile-box">
                    ${avatarHtml}
                    <div class="reviewer-meta">
                        <span class="reviewer-name">${escapeHTML(rev.name)}</span>
                        <span class="review-event-badge">${escapeHTML(rev.eventType || '')}</span>
                    </div>
                </div>
                <div class="review-rating-date">
                    <div class="stars-display">${starsHtml}</div>
                    <span class="review-date">${formattedDate}</span>
                </div>
            </div>
            <p class="review-body-text">"${escapeHTML(rev.message)}"</p>`;

        reviewsFeed.appendChild(card);
    });

    compileStatistics(reviews);
}

/* --------------------------------------------------------------------------
   11. LOAD REVIEWS FROM FIRESTORE
   Only reads documents where status == "Approved", newest first.
   -------------------------------------------------------------------------- */
async function loadReviews() {
    if (!reviewsFeed) return;

    /* Loading state */
    reviewsFeed.innerHTML = `
        <div style="text-align:center;padding:50px 20px;color:#777;">
            <i class="fa-solid fa-circle-notch fa-spin"
               style="font-size:2rem;color:var(--accent-gold);display:block;margin-bottom:15px;"></i>
            <p>Loading curated reviews...</p>
        </div>`;

    try {
        const snapshot = await db.collection('reviews')
            .where('status', '==', 'Approved')
            .orderBy('timestamp', 'desc')
            .get();

        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderReviews(reviews);

    } catch (err) {
        console.error('Firestore load error:', err);
        reviewsFeed.innerHTML = `
            <div style="text-align:center;padding:50px 20px;
                        color:#e57373;border:1px solid rgba(229,115,115,0.2);
                        background:rgba(229,115,115,0.03);">
                <i class="fa-solid fa-triangle-exclamation"
                   style="font-size:2rem;display:block;margin-bottom:15px;"></i>
                <p style="font-weight:400;margin-bottom:10px;">Unable to load reviews.</p>
                <p style="font-size:0.85rem;color:#ccc;margin-bottom:15px;">
                    Please check your connection and try again.
                </p>
                <button type="button"
                        class="btn btn-outline"
                        onclick="loadReviews()"
                        style="font-size:0.7rem;padding:8px 16px;
                               min-width:auto;width:auto;display:inline-block;">
                    Retry
                </button>
            </div>`;
        compileStatistics([]);
    }
}

/* Expose globally so the inline retry button can call it */
window.loadReviews = loadReviews;

/* --------------------------------------------------------------------------
   12. UPLOAD PHOTO TO FIREBASE STORAGE
   Returns the public download URL, or "" if no file is selected.
   -------------------------------------------------------------------------- */
async function uploadPhoto() {
    if (!selectedPhotoFile) return '';

    const path      = `review_photos/${Date.now()}_${selectedPhotoFile.name}`;
    const ref       = storage.ref(path);
    const snapshot  = await ref.put(selectedPhotoFile);
    const downloadURL = await snapshot.ref.getDownloadURL();
    return downloadURL;
}

/* --------------------------------------------------------------------------
   13. FORM VALIDATION
   -------------------------------------------------------------------------- */
function validateForm() {
    const nameOk    = checkField(reviewNameInput);
    const emailOk   = checkField(reviewEmailInput, validateEmail);
    const eventOk   = checkField(reviewEventType);
    const messageOk = checkField(reviewMessageInput);

    const ratingVal    = reviewRatingInput.value.trim();
    const ratingParent = reviewRatingInput.closest('.form-group');
    const ratingOk     = ratingVal !== '' &&
                         parseInt(ratingVal) >= 1 &&
                         parseInt(ratingVal) <= 5;
    if (ratingParent) ratingParent.classList.toggle('error', !ratingOk);

    return nameOk && emailOk && eventOk && ratingOk && messageOk;
}

/* --------------------------------------------------------------------------
   14. SUBMIT REVIEW
   -------------------------------------------------------------------------- */
if (reviewForm) {
    reviewForm.addEventListener('submit', async e => {
        e.preventDefault();

        if (!validateForm()) return;

        /* Disable button + show spinner */
        reviewSubmitBtn.classList.add('submitting');
        reviewSubmitBtn.disabled = true;

        try {
            /* Upload photo first (returns "" if none selected) */
            const photoUrl = await uploadPhoto();

            /* Build Firestore document – exactly the required structure */
            const doc = {
                name:      reviewNameInput.value.trim(),
                email:     reviewEmailInput.value.trim(),
                phone:     reviewPhoneInput ? reviewPhoneInput.value.trim() : '',  // ← fixed
                eventType: reviewEventType.value.trim(),
                rating:    parseInt(reviewRatingInput.value.trim()),
                message:   reviewMessageInput.value.trim(),
                photoUrl:  photoUrl,
                status:    'Pending',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()         // ← serverTimestamp
            };

            await db.collection('reviews').add(doc);

            /* Success */
            reviewSuccessOverlay.classList.add('open');
            resetForm();

        } catch (err) {
            console.error('Firestore submit error:', err);
            alert('There was a problem submitting your review. Please try again.');
        } finally {
            reviewSubmitBtn.classList.remove('submitting');
            reviewSubmitBtn.disabled = false;
        }
    });
}

/* --------------------------------------------------------------------------
   15. RESET FORM (called after success)
   -------------------------------------------------------------------------- */
function resetForm() {
    reviewForm.reset();
    clearPhotoSelection();

    /* Reset star rating */
    reviewRatingInput.value = '';
    resetStarsHighlight();

    /* Clear all error states */
    document.querySelectorAll('.review-form-panel .form-group').forEach(g => {
        g.classList.remove('error');
    });

    /* Reset select floating label */
    if (reviewEventType) reviewEventType.classList.remove('has-value');
}

/* --------------------------------------------------------------------------
   16. SUCCESS BANNER CLOSE
   -------------------------------------------------------------------------- */
if (reviewSuccessClose) {
    reviewSuccessClose.addEventListener('click', () => {
        reviewSuccessOverlay.classList.remove('open');
    });
}

/* --------------------------------------------------------------------------
   17. INITIAL LOAD
   -------------------------------------------------------------------------- */
loadReviews();
