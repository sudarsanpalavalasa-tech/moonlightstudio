/* ==========================================================================
   Moonlight Studio & Photography - Core JavaScript Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. DATA REPOSITORY (Blog Articles Data)
    // ==========================================================================
    const BLOG_ARTICLES = {
        "1": {
            category: "Technique",
            title: "The Art of Shadow Play: Mastering High-Contrast Lighting",
            date: "July 4, 2026",
            author: "Thomas Sterling",
            coverImage: "images/portrait_1.png",
            content: `
                <p>Lighting is the fundamental language of photography, but all too often, photographers focus entirely on the source of illumination rather than its natural counterpart: the shadow. In fine art portraiture, shadows are not empty black space; they are structural shapes that define depth, build narrative, and evoke dramatic emotional responses.</p>
                <p>The technique of chiaroscuro—originally popularized by Renaissance painters like Caravaggio—focuses on the sharp, painterly transitions between deep darkness and intense, singular light. When done correctly in a studio setting, this creates a three-dimensional carving of the human form that feels sculptural and timeless.</p>
                <h4 class="blog-modal-quote">"To paint with light, one must first learn to understand the dark. The shadow details tell the real story of the subject."</h4>
                <p>To begin experimenting with high-contrast portraiture, start with a single light source. A large softbox placed at a 90-degree angle to the subject (rim lighting) will emphasize profile contours. Alternatively, raising the light to a 45-degree angle above the head and slightly to the side (Rembrandt lighting) will create the signature triangle of light on the shadowed cheek.</p>
                <p>Avoid using digital reflectors or fills. Let the shadow fall off into complete, rich obsidian. When post-processing, pay close attention to your tone curves. Instead of crushing the blacks completely, preserve just a microscopic amount of grain in the shadow textures to maintain a premium, analog feel.</p>
            `
        },
        "2": {
            category: "Travel",
            title: "Icelandic Monoliths: 5 Tips for Long-Exposure Seascapes",
            date: "June 20, 2026",
            author: "Thomas Sterling",
            coverImage: "images/landscape_2.png",
            content: `
                <p>Few places on earth challenge a landscape photographer like the southern coastline of Iceland. The black sands of Vik, combined with the towering basalt stacks rising from the roaring Atlantic, present a landscape of monumental scale and ethereal beauty. To truly capture the passage of time against these immovable giants, long-exposure photography is key.</p>
                <p>Here are five key principles I apply during my expeditions to capture the silent majesty of volcanic seascapes:</p>
                <p><strong>1. Invest in High-Density (ND) Filters:</strong> To smooth out wild Atlantic waves into an ethereal, misty fog, you will need exposure times ranging from 10 to 60 seconds. A 10-stop solid ND filter is an essential tool to achieve this in daylight conditions.</p>
                <p><strong>2. Anchoring the Tripod:</strong> In Icelandic wind, standard carbon fiber tripods will vibrate, ruining image sharpness. Anchor your tripod deep into the wet volcanic sand and suspend your camera bag from the center column to add weight.</p>
                <p><strong>3. Watch the Tide Cycles:</strong> The rogue waves at Reynisfjara are notoriously dangerous. Keep a safe distance and study the water patterns. The best compositions happen when the tide recedes, leaving a reflective glass layer on the black sand.</p>
                <p><strong>4. Compose with Scale:</strong> Place a tiny element, like a distant rock stack or a lone cabin, in the frame to emphasize the gargantuan proportions of the surrounding cliffs.</p>
                <p><strong>5. Manual Focus in Low Light:</strong> The sea mist and ND filter will cause auto-focus sensors to hunt. Disable auto-focus, zoom in using your camera's live view display, and lock focus manually on the sharpest basalt stack before attaching the filter.</p>
            `
        },
        "3": {
            category: "Aesthetics",
            title: "Why Minimalism Wins in Modern Editorial Design",
            date: "May 15, 2026",
            author: "Thomas Sterling",
            coverImage: "images/fashion_2.png",
            content: `
                <p>In a world characterized by constant visual noise, digital clutter, and blinking banner ads, quietness has become the ultimate luxury. Minimalism in editorial fashion photography is not simply the absence of color or props; it is a deliberate, highly calculated curation of negative space that forces the viewer's eye to rest on the essential core.</p>
                <p>A minimalist photo works by lowering the cognitive load on the viewer. By stripping away busy street scenes, complex background textures, or excessive accessories, we highlight the elegant flow of a drape, the geometric angle of a model's posture, or the subtle texture of plaster wall shadows.</p>
                <h4 class="blog-modal-quote">"Simplicity is not the lack of clutter, but the presence of clarity."</h4>
                <p>To achieve this aesthetic, focus on color harmony. Monochromatic palettes—such as sand, ivory, charcoal, and warm bronze—cooperate to build a sense of high-end calmness. Contrast this with dynamic posing: a bold, angled body shape stands out dramatically against a vast, empty studio canvas.</p>
                <p>Remember that in minimalist compositions, every tiny detail counts. A single stray hair, an unpressed wrinkle in the fabric, or an uneven shadow line will break the illusion. Master your set details before pressing the shutter, and let the negative space breathe.</p>
            `
        }
    };

    // Global Helper: Email validation format check
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email.toLowerCase());
    }

    // ==========================================================================
    // 2. SPA ROUTER SYSTEM (Section Transitions)
    // ==========================================================================
    const sections = document.querySelectorAll('.view-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const mainHeader = document.getElementById('main-header');

    function navigateToSection() {
        const hash = window.location.hash || '#home';
        let targetSection = document.querySelector(hash);

        if (!targetSection) {
            targetSection = document.getElementById('home');
        }

        // 1. Hide active sections smoothly
        sections.forEach(sec => {
            if (sec.classList.contains('active-view')) {
                sec.classList.remove('animate-view-in');
                setTimeout(() => {
                    sec.classList.remove('active-view');
                }, 300); // Wait for transition fade-out
            }
        });

        // 2. Display targeted section with delay
        setTimeout(() => {
            sections.forEach(sec => sec.classList.remove('active-view', 'animate-view-in'));

            targetSection.classList.add('active-view');

            // Force a reflow for smooth transform animation
            void targetSection.offsetWidth;

            targetSection.classList.add('animate-view-in');

            // Reset scroll position on page change
            window.scrollTo({ top: 0, behavior: 'instant' });

            // Adjust header styling states
            toggleHeaderBackground(hash);
        }, 300);

        // 3. Update Menu links styling (Active indicator lines)
        updateActiveMenuLinks(hash);
    }

    function toggleHeaderBackground(hash) {
        // If we are on home, let header remain transparent unless scrolled.
        // For other pages, make it dark immediately to ensure readable navigation.
        if (hash === '#home') {
            if (window.scrollY > 50) {
                mainHeader.classList.add('header-scrolled');
                mainHeader.classList.remove('header-transparent');
            } else {
                mainHeader.classList.remove('header-scrolled');
                mainHeader.classList.add('header-transparent');
            }
        } else {
            mainHeader.classList.add('header-scrolled');
            mainHeader.classList.remove('header-transparent');
        }
    }

    function updateActiveMenuLinks(hash) {
        // Desktop nav
        navLinks.forEach(link => {
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Mobile nav
        mobileLinks.forEach(link => {
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Set initial view and bind hash changes
    window.addEventListener('hashchange', navigateToSection);

    // Trigger on page refresh load
    if (!window.location.hash) {
        window.location.hash = '#home';
    } else {
        navigateToSection();
    }


    // ==========================================================================
    // 3. RESPONSIVE MOBILE NAVIGATION MENU OVERLAY
    // ==========================================================================
    const hamburgerBtn = document.getElementById('hamburger-menu-btn');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');

    function toggleMobileMenu() {
        const isOpen = hamburgerBtn.classList.toggle('open');
        mobileOverlay.classList.toggle('open', isOpen);

        // Prevent body scroll when menu overlay is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMobileMenu() {
        hamburgerBtn.classList.remove('open');
        mobileOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', toggleMobileMenu);

    // Close mobile overlay on clicking any navigation links
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });


    // ==========================================================================
    // 4. HOME EXPANDING COLUMNS CONTROLLER
    // ==========================================================================
    const expandingCols = document.querySelectorAll('.expanding-col');
    const colBookBtns = document.querySelectorAll('.col-book-cta');

    // Expand column on click/tap (crucial for mobile/tablet responsive actions)
    expandingCols.forEach(col => {
        col.addEventListener('click', (e) => {
            // If the user clicked a button inside the column, don't interfere
            if (e.target.closest('.btn')) return;

            expandingCols.forEach(c => c.classList.remove('active-col'));
            col.classList.add('active-col');
        });
    });

    // Wire up home columns "Book Session" buttons to pass package to the scheduler
    colBookBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const packageName = e.target.getAttribute('data-package');
            if (packageName) {
                bookingState.package = packageName;
                if (hiddenPackageInput) hiddenPackageInput.value = packageName;

                if (summaryPackage) {
                    summaryPackage.textContent = packageName;
                    summaryPackage.classList.add('text-gold');
                }

                if (bookingWarning) bookingWarning.style.display = 'none';

                // Route automatically to Booking
                window.location.hash = '#booking';
            }
        });
    });


    // ==========================================================================
    // 5. PORTFOLIO FILTER SYSTEM (Masonry Filter Animations)
    // ==========================================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active state from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const filterValue = e.target.getAttribute('data-filter');

            // Apply fade-out scale animation to all items first
            portfolioItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';
            });

            // Transition filter layouts
            setTimeout(() => {
                portfolioItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');
                    if (filterValue === 'all' || itemCategory === filterValue) {
                        item.classList.remove('filtered-out');
                        // Force layout reflow
                        void item.offsetWidth;
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    } else {
                        item.classList.add('filtered-out');
                    }
                });
            }, 300);
        });
    });


    // ==========================================================================
    // 6. PORTFOLIO LIGHTBOX MODULE (Responsive Touch/Keyboard Lightbox)
    // ==========================================================================
    const lightbox = document.getElementById('global-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCategory = document.getElementById('lightbox-image-category');
    const lightboxTitle = document.getElementById('lightbox-image-title');
    const lightboxClose = document.getElementById('lightbox-close-btn');
    const lightboxPrev = document.getElementById('lightbox-prev-btn');
    const lightboxNext = document.getElementById('lightbox-next-btn');
    const lightboxSpinner = document.getElementById('lightbox-spinner');

    let activeItemsList = []; // Holds items that are currently filtered in
    let activeLightboxIndex = 0;

    // Load list of visible portfolio items
    function updateActiveItemsList() {
        activeItemsList = Array.from(portfolioItems).filter(item => !item.classList.contains('filtered-out'));
    }

    function openLightbox(index) {
        updateActiveItemsList();
        activeLightboxIndex = index;

        lightbox.setAttribute('aria-hidden', 'false');
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Lock background scrolling

        loadLightboxContent();
    }

    function closeLightbox() {
        lightbox.setAttribute('aria-hidden', 'true');
        lightbox.style.display = 'none';
        document.body.style.overflow = ''; // Unlock background
        lightboxImg.src = '';
    }

    function loadLightboxContent() {
        if (activeItemsList.length === 0) return;

        // Wrap-around boundary handling
        if (activeLightboxIndex >= activeItemsList.length) activeLightboxIndex = 0;
        if (activeLightboxIndex < 0) activeLightboxIndex = activeItemsList.length - 1;

        const currentItem = activeItemsList[activeLightboxIndex];
        const imgElement = currentItem.querySelector('img');
        const titleElement = currentItem.querySelector('.overlay-info h3');
        const catElement = currentItem.querySelector('.overlay-info .category-tag');

        // Show spinner loader
        lightboxSpinner.classList.add('loading');
        lightboxImg.style.opacity = '0';

        // Load details
        lightboxImg.src = imgElement.src;
        lightboxImg.alt = imgElement.alt;
        lightboxCategory.textContent = catElement.textContent;
        lightboxTitle.textContent = titleElement.textContent;

        lightboxImg.onload = () => {
            lightboxSpinner.classList.remove('loading');
            lightboxImg.style.opacity = '1';
        };
    }

    function navigateLightbox(direction) {
        activeLightboxIndex += direction;
        loadLightboxContent();
    }

    // Attach click events on portfolio items
    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            updateActiveItemsList();
            const index = activeItemsList.indexOf(item);
            if (index !== -1) {
                openLightbox(index);
            }
        });
    });

    // Control binds
    if (lightboxClose && lightboxPrev && lightboxNext) {
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
        lightboxNext.addEventListener('click', () => navigateLightbox(1));
    }

    // Close lightbox on clicking outside content area
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-wrapper')) {
            closeLightbox();
        }
    });

    // Keyboard support (ESC, Left, Right)
    document.addEventListener('keydown', (e) => {
        if (lightbox.getAttribute('aria-hidden') === 'false') {
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft') navigateLightbox(-1);
            else if (e.key === 'ArrowRight') navigateLightbox(1);
        }
    });

    // Touch Swipe Gestures
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, { passive: true });

    function handleSwipeGesture() {
        const threshold = 50; // swipe offset minimum
        if (touchEndX < touchStartX - threshold) {
            navigateLightbox(1); // Swipe Left -> Next Image
        } else if (touchEndX > touchStartX + threshold) {
            navigateLightbox(-1); // Swipe Right -> Prev Image
        }
    }


    // ==========================================================================
    // 7. STATISTICS COUNT-UP ANIMATION (Intersection Observer)
    // ==========================================================================
    const statsPanel = document.getElementById('about-stats-panel');
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersInitiated = false;

    function startCounters() {
        if (countersInitiated) return;
        countersInitiated = true;

        statNumbers.forEach(num => {
            const targetCount = parseInt(num.getAttribute('data-count'));
            const duration = 1500; // 1.5 seconds animation
            const steps = 60;
            const stepValue = targetCount / steps;
            let currentCount = 0;
            let stepIndex = 0;

            const counterInterval = setInterval(() => {
                stepIndex++;
                currentCount += stepValue;

                if (stepIndex >= steps) {
                    num.textContent = targetCount;
                    clearInterval(counterInterval);
                } else {
                    num.textContent = Math.floor(currentCount);
                }
            }, duration / steps);
        });
    }

    // Set Intersection observer to run count up once element is visible
    if (statsPanel) {
        const observerOptions = {
            root: null,
            threshold: 0.2 // Trigger when 20% visible
        };

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCounters();
                    statsObserver.unobserve(entry.target); // Stop observing after single run
                }
            });
        }, observerOptions);

        statsObserver.observe(statsPanel);
    }


    // ==========================================================================
    // 8. INTERACTIVE DYNAMIC SCROLL ANIMATIONS (Reveal Elements)
    // ==========================================================================
    const revealElements = document.querySelectorAll('.animate-on-scroll');

    const revealObserverOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px' // offset bottom triggers slightly
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(el => revealObserver.observe(el));


    // ==========================================================================
    // 9. DYNAMIC BLOG READ MODAL SYSTEM
    // ==========================================================================
    const blogReaderModal = document.getElementById('blog-reader-modal');
    const blogReaderClose = document.getElementById('blog-modal-close-btn');
    const blogModalBody = document.getElementById('blog-modal-article-body');
    const blogCards = document.querySelectorAll('.blog-card');

    function openBlogArticle(postId) {
        const article = BLOG_ARTICLES[postId];
        if (!article) return;

        // Generate full semantic layout
        const articleHtml = `
            <div class="blog-modal-header">
                <span class="blog-modal-category">${article.category}</span>
                <h1 class="blog-modal-title">${article.title}</h1>
                <div class="blog-modal-meta">
                    <span><i class="fa-solid fa-user"></i> By ${article.author}</span>
                    <span><i class="fa-solid fa-calendar-days"></i> Published ${article.date}</span>
                </div>
            </div>
            <img class="blog-modal-cover" src="${article.coverImage}" alt="${article.title}">
            <div class="blog-modal-article-text">
                ${article.content}
            </div>
        `;

        blogModalBody.innerHTML = articleHtml;
        blogReaderModal.setAttribute('aria-hidden', 'false');
        blogReaderModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // lock scrolling

        // Smooth fade-in animation
        void blogReaderModal.offsetWidth;
        blogReaderModal.style.opacity = '1';
    }

    function closeBlogArticle() {
        blogReaderModal.style.opacity = '0';
        setTimeout(() => {
            blogReaderModal.setAttribute('aria-hidden', 'true');
            blogReaderModal.style.display = 'none';
            blogModalBody.innerHTML = '';
            document.body.style.overflow = ''; // unlock scroll
        }, 300);
    }

    blogCards.forEach(card => {
        const readBtn = card.querySelector('.read-more-trigger');
        const imgBox = card.querySelector('.blog-card-img');
        const titleBox = card.querySelector('.blog-card-content h3');
        const postId = card.getAttribute('data-post-id');

        // Open article on clicking title, image, or button
        [readBtn, imgBox, titleBox].forEach(trigger => {
            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    openBlogArticle(postId);
                });
            }
        });
    });

    if (blogReaderClose) {
        blogReaderClose.addEventListener('click', closeBlogArticle);
    }

    // Close on clicking backdrop
    blogReaderModal.addEventListener('click', (e) => {
        if (e.target === blogReaderModal || e.target.classList.contains('blog-reader-container')) {
            closeBlogArticle();
        }
    });


    // ==========================================================================
    // 10. INTERACTIVE BOOKING ENGINE (Calendar, Time Slots, & Receipt Modal)
    // ==========================================================================

    // Selection state trackers
    let bookingState = {
        date: null, // Date object
        time: ""
    };

    // DOM References
    const daysGrid = document.getElementById('calendar-days-grid');
    const monthYearLabel = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('calendar-prev-month');
    const nextMonthBtn = document.getElementById('calendar-next-month');
    const timeSlots = document.querySelectorAll('.time-slot-btn');

    const summaryDate = document.getElementById('summary-date-val');
    const summaryTime = document.getElementById('summary-time-val');

    const bookingForm = document.getElementById('session-booking-form');
    const bookingWarning = document.getElementById('booking-alert-box');
    const bookingSubmitBtn = document.getElementById('booking-submit-btn');

    // Receipt Modal references
    const receiptModal = document.getElementById('booking-receipt-modal');
    const receiptClose = document.getElementById('receipt-close-btn');
    const receiptDone = document.getElementById('receipt-done-btn');

    const receiptCode = document.getElementById('receipt-code-val');
    const receiptName = document.getElementById('receipt-name-val');
    const receiptEmail = document.getElementById('receipt-email-val');
    const receiptDatetime = document.getElementById('receipt-datetime-val');

    // Calendar States
    const today = new Date();
    let displayYear = 2026;
    let displayMonth = 6; // July (0-indexed, so 6 is July)

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Render Calendar
    function renderCalendar(year, month) {
        daysGrid.innerHTML = '';
        monthYearLabel.textContent = `${monthNames[month]} ${year}`;

        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        // 1. Empty cells for padding days
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty-day');
            daysGrid.appendChild(emptyCell);
        }

        // 2. Generating active days
        for (let day = 1; day <= totalDays; day++) {
            const dayCell = document.createElement('button');
            dayCell.type = "button";
            dayCell.classList.add('calendar-day');
            dayCell.textContent = day;

            const cellDate = new Date(year, month, day);

            // Check if day is in the past relative to local time (July 7, 2026)
            // (We set mock system time to 2026-07-07)
            const targetMinDate = new Date(2026, 6, 7);

            if (cellDate < targetMinDate) {
                dayCell.classList.add('disabled-day');
                dayCell.disabled = true;
            } else {
                // If it is our selected date, style it
                if (bookingState.date &&
                    bookingState.date.getDate() === day &&
                    bookingState.date.getMonth() === month &&
                    bookingState.date.getFullYear() === year) {
                    dayCell.classList.add('active-date');
                }

                dayCell.addEventListener('click', () => {
                    // Update active styling
                    document.querySelectorAll('.calendar-day').forEach(cell => cell.classList.remove('active-date'));
                    dayCell.classList.add('active-date');

                    // Update State
                    bookingState.date = cellDate;

                    // Update summary display UI
                    const formattedDate = cellDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    });
                    summaryDate.textContent = formattedDate;
                    summaryDate.classList.add('text-gold');

                    // Hide alerts if active
                    bookingWarning.style.display = 'none';
                });
            }

            daysGrid.appendChild(dayCell);
        }

        // Prevent scrolling to months before July 2026
        if (prevMonthBtn) {
            if (year === 2026 && month === 6) {
                prevMonthBtn.disabled = true;
                prevMonthBtn.style.opacity = '0.25';
                prevMonthBtn.style.cursor = 'not-allowed';
            } else {
                prevMonthBtn.disabled = false;
                prevMonthBtn.style.opacity = '1';
                prevMonthBtn.style.cursor = 'pointer';
            }
        }
    }

    // Initialize calendar controls
    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            displayMonth--;
            if (displayMonth < 0) {
                displayMonth = 11;
                displayYear--;
            }
            renderCalendar(displayYear, displayMonth);
        });

        nextMonthBtn.addEventListener('click', () => {
            displayMonth++;
            if (displayMonth > 11) {
                displayMonth = 0;
                displayYear++;
            }
            renderCalendar(displayYear, displayMonth);
        });
    }

    // Initialize initial calendar load
    renderCalendar(displayYear, displayMonth);

    // Time Slot buttons listeners
    timeSlots.forEach(slot => {
        slot.addEventListener('click', (e) => {
            e.preventDefault();
            timeSlots.forEach(s => s.classList.remove('active-slot'));
            slot.classList.add('active-slot');

            const selectedTimeVal = slot.getAttribute('data-time');
            bookingState.time = selectedTimeVal;

            summaryTime.textContent = selectedTimeVal;
            summaryTime.classList.add('text-gold');

            bookingWarning.style.display = 'none';
        });
    });

    // Package click handlers from Services page CTAs (redirects only)
    const bookingBtns = document.querySelectorAll('.card-cta');
    bookingBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (bookingWarning) bookingWarning.style.display = 'none';
            // Route automatically to Booking
            window.location.hash = '#booking';
        });
    });

    // Floating label event handlers for Booking Form inputs
    const bookingInputs = [
        document.getElementById('booking-name'),
        document.getElementById('booking-email'),
        document.getElementById('booking-phone')
    ];

    bookingInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                const parent = input.closest('.form-group');
                if (parent.classList.contains('error')) {
                    parent.classList.remove('error');
                }
            });
        }
    });

    // Check custom fields validations
    function checkField(input) {
        const parent = input.closest('.form-group');
        let isValid = true;

        if (input.type === 'email') {
            isValid = validateEmail(input.value.trim());
        } else {
            isValid = input.value.trim() !== '';
        }

        if (!isValid) {
            parent.classList.add('error');
        } else {
            parent.classList.remove('error');
        }
        return isValid;
    }

    // Submit appointment handler
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // 1. Validate choices selected (Date, Time)
            if (!bookingState.date || !bookingState.time) {
                bookingWarning.style.display = 'flex';
                return;
            }
            bookingWarning.style.display = 'none';

            // 2. Validate client input details
            const isNameValid = checkField(bookingInputs[0]);
            const isEmailValid = checkField(bookingInputs[1]);
            const isPhoneValid = checkField(bookingInputs[2]);

            if (isNameValid && isEmailValid && isPhoneValid) {
                // Trigger button loading spinner
                bookingSubmitBtn.classList.add('submitting');
                bookingSubmitBtn.disabled = true;

                const invoiceCode = `MLS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
                const formattedDate = bookingState.date.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
                const notesVal = document.getElementById('booking-notes') ? document.getElementById('booking-notes').value.trim() : '';

                fetch("https://formsubmit.co/ajax/sudarsanpalavalasa@gmail.com", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        "Reservation ID": invoiceCode,
                        "Client Name": bookingInputs[0].value.trim(),
                        "Client Email": bookingInputs[1].value.trim(),
                        "Client Phone": bookingInputs[2].value.trim(),
                        "Selected Date": formattedDate,
                        "Selected Time": bookingState.time,
                        "Selected Package": bookingState.package || "General Session",
                        "Creative Notes": notesVal
                    })
                })
                    .then(response => {
                        bookingSubmitBtn.classList.remove('submitting');
                        bookingSubmitBtn.disabled = false;

                        if (response.ok) {
                            // Inject values into receipt modal fields
                            receiptCode.textContent = invoiceCode;
                            receiptName.textContent = bookingInputs[0].value.trim();
                            receiptEmail.textContent = bookingInputs[1].value.trim();
                            receiptDatetime.textContent = `${formattedDate} @ ${bookingState.time}`;

                            // Open Receipt Overlay Dialog
                            receiptModal.setAttribute('aria-hidden', 'false');
                            receiptModal.style.display = 'flex';
                            document.body.style.overflow = 'hidden'; // lock background scrolling
                        } else {
                            alert("There was an error saving your booking reservation. Please try again.");
                        }
                    })
                    .catch(error => {
                        bookingSubmitBtn.classList.remove('submitting');
                        bookingSubmitBtn.disabled = false;
                        alert("There was a connection error. Please try again.");
                    });
            }
        });
    }

    // Receipt Modal Close controls
    function closeReceiptModal() {
        receiptModal.setAttribute('aria-hidden', 'true');
        receiptModal.style.display = 'none';
        document.body.style.overflow = ''; // unlock scroll

        // Reset booking form and states
        bookingForm.reset();
        bookingState = { date: null, time: "" };

        // Reset summary views
        summaryDate.textContent = "Choose Date";
        summaryDate.classList.remove('text-gold');
        summaryTime.textContent = "Choose Time";
        summaryTime.classList.remove('text-gold');

        // Clear active classes in calendar and slots
        document.querySelectorAll('.calendar-day').forEach(cell => cell.classList.remove('active-date'));
        timeSlots.forEach(slot => slot.classList.remove('active-slot'));

        // Route back to portfolio or home
        window.location.hash = '#home';
    }

    if (receiptClose && receiptDone) {
        [receiptClose, receiptDone].forEach(btn => {
            btn.addEventListener('click', closeReceiptModal);
        });
    }


    // ==========================================================================
    // 11. GENERAL ATELIER CONTACT FORM VALIDATION & SUBMIT
    // ==========================================================================
    const contactForm = document.getElementById('portfolio-contact-form');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const successOverlay = document.getElementById('form-success-banner');
    const successClose = document.getElementById('success-close-btn');
    const submitBtn = document.getElementById('contact-submit-btn');



    function checkContactField(input, validationFn) {
        const parent = input.closest('.form-group');
        let isValid = true;

        if (validationFn) {
            isValid = validationFn(input.value.trim());
        } else {
            isValid = input.value.trim() !== '';
        }

        if (!isValid) {
            parent.classList.add('error');
        } else {
            parent.classList.remove('error');
        }

        return isValid;
    }

    [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                const parent = input.closest('.form-group');
                if (parent.classList.contains('error')) {
                    parent.classList.remove('error');
                }
            });
        }
    });

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Run validation check
            const isNameValid = checkContactField(nameInput);
            const isEmailValid = checkContactField(emailInput, validateEmail);
            const isSubjectValid = checkContactField(subjectInput);
            const isMessageValid = checkContactField(messageInput);

            if (isNameValid && isEmailValid && isSubjectValid && isMessageValid) {
                // Form is valid - initiate loading animation
                submitBtn.classList.add('submitting');
                submitBtn.disabled = true;

                fetch("https://formsubmit.co/ajax/sudarsanpalavalasa@gmail.com", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        "Name": nameInput.value.trim(),
                        "Email": emailInput.value.trim(),
                        "Subject": subjectInput.value.trim(),
                        "Message": messageInput.value.trim()
                    })
                })
                    .then(response => {
                        submitBtn.classList.remove('submitting');
                        submitBtn.disabled = false;

                        if (response.ok) {
                            // Show success display panel
                            successOverlay.classList.add('open');
                        } else {
                            alert("There was an error sending your inquiry. Please try again.");
                        }
                    })
                    .catch(error => {
                        submitBtn.classList.remove('submitting');
                        submitBtn.disabled = false;
                        alert("There was a connection error. Please try again.");
                    });
            }
        });
    }

    if (successClose) {
        successClose.addEventListener('click', () => {
            contactForm.reset();

            document.querySelectorAll('.contact-form-panel .form-group').forEach(group => {
                group.classList.remove('error');
            });

            successOverlay.classList.remove('open');
        });
    }


    // ==========================================================================
    // 12. SCROLL EVENTS (Indicator & Header Sticky styling)
    // ==========================================================================
    const scrollBar = document.getElementById('scroll-progress-bar');

    window.addEventListener('scroll', () => {
        // A. Scroll Progress Bar
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (windowHeight > 0) {
            const scrolledPercentage = (window.scrollY / windowHeight) * 100;
            scrollBar.style.width = scrolledPercentage + '%';
        }

        // B. Floating Header scroll highlight
        const activeHash = window.location.hash || '#home';
        if (activeHash === '#home') {
            if (window.scrollY > 50) {
                mainHeader.classList.add('header-scrolled');
                mainHeader.classList.remove('header-transparent');
            } else {
                mainHeader.classList.remove('header-scrolled');
                mainHeader.classList.add('header-transparent');
            }
        }
    });

});
