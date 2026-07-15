/* ==========================================================================
   Moonlight Studio & Photography - Core JavaScript Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {



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

                const email = "moonlightstudioandphotography@gmail.com";
                const subject = encodeURIComponent(`Studio Booking Reservation: ${invoiceCode}`);
                const body = encodeURIComponent(
                    `Reservation ID: ${invoiceCode}\n` +
                    `Client Name: ${bookingInputs[0].value.trim()}\n` +
                    `Client Email: ${bookingInputs[1].value.trim()}\n` +
                    `Client Phone: ${bookingInputs[2].value.trim()}\n` +
                    `Selected Date: ${formattedDate}\n` +
                    `Selected Time: ${bookingState.time}\n` +
                    `Selected Package: ${bookingState.package || "General Session"}\n\n` +
                    `Creative Notes:\n${notesVal}`
                );

                // Open default email client with pre-filled details
                window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

                setTimeout(() => {
                    bookingSubmitBtn.classList.remove('submitting');
                    bookingSubmitBtn.disabled = false;

                    // Inject values into receipt modal fields
                    receiptCode.textContent = invoiceCode;
                    receiptName.textContent = bookingInputs[0].value.trim();
                    receiptEmail.textContent = bookingInputs[1].value.trim();
                    receiptDatetime.textContent = `${formattedDate} @ ${bookingState.time}`;

                    // Open Receipt Overlay Dialog
                    receiptModal.setAttribute('aria-hidden', 'false');
                    receiptModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden'; // lock background scrolling
                }, 1000);
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
    const phoneInput = document.getElementById('contact-phone');
    const eventTypeInput = document.getElementById('contact-event-type');
    const eventDateInput = document.getElementById('contact-event-date');
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

    [nameInput, emailInput, phoneInput, eventTypeInput, eventDateInput, messageInput].forEach(input => {
        if (input) {
            ['input', 'change'].forEach(evtName => {
                input.addEventListener(evtName, () => {
                    const parent = input.closest('.form-group');
                    if (parent.classList.contains('error')) {
                        parent.classList.remove('error');
                    }
                });
            });
        }
    });

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Run validation check
            const isNameValid = checkContactField(nameInput);
            const isEmailValid = checkContactField(emailInput, validateEmail);
            const isPhoneValid = checkContactField(phoneInput);
            const isEventTypeValid = checkContactField(eventTypeInput);
            const isEventDateValid = checkContactField(eventDateInput);
            const isMessageValid = checkContactField(messageInput);

            if (isNameValid && isEmailValid && isPhoneValid && isEventTypeValid && isEventDateValid && isMessageValid) {
                // Form is valid - initiate loading animation
                submitBtn.classList.add('submitting');
                submitBtn.disabled = true;

                const email = "moonlightstudioandphotography@gmail.com";
                const formData = {
                    "Full Name": nameInput.value.trim(),
                    "Email Address": emailInput.value.trim(),
                    "Phone Number": phoneInput.value.trim(),
                    "Event Type": eventTypeInput.value.trim(),
                    "Preferred Event Date": eventDateInput.value.trim(),
                    "Message": messageInput.value.trim(),
                    _subject: `New Event Inquiry [${eventTypeInput.value.trim()}] from ${nameInput.value.trim()}`
                };

                // Submit form data using FormSubmit AJAX API
                fetch(`https://formsubmit.co/ajax/${email}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        submitBtn.classList.remove('submitting');
                        submitBtn.disabled = false;
                        // Show success display panel
                        successOverlay.classList.add('open');
                    })
                    .catch(error => {
                        console.error('Error submitting form via AJAX, falling back to mailto:', error);

                        // Fallback to mailto if AJAX fails (e.g. offline, adblocker, server down)
                        const mailtoSubject = encodeURIComponent(`New Event Inquiry [${eventTypeInput.value.trim()}]`);
                        const mailtoBody = encodeURIComponent(
                            `Full Name: ${nameInput.value.trim()}\n` +
                            `Email Address: ${emailInput.value.trim()}\n` +
                            `Phone Number: ${phoneInput.value.trim()}\n` +
                            `Event Type: ${eventTypeInput.value.trim()}\n` +
                            `Preferred Event Date: ${eventDateInput.value.trim()}\n\n` +
                            `Message:\n${messageInput.value.trim()}`
                        );
                        window.location.href = `mailto:${email}?subject=${mailtoSubject}&body=${mailtoBody}`;

                        submitBtn.classList.remove('submitting');
                        submitBtn.disabled = false;
                        successOverlay.classList.add('open');
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
    // 12. BESPOKE CLIENT REVIEWS SYSTEM (Google Sheets & Apps Script Integration)
    // ==========================================================================

    // Web App URL configuration (Paste your deployed Google Apps Script URL here)
    const APPS_SCRIPT_URL = "";

    const reviewForm = document.getElementById('review-submit-form');
    const reviewNameInput = document.getElementById('review-name');
    const reviewEmailInput = document.getElementById('review-email');
    const reviewPhoneInput = document.getElementById('review-phone');
    const reviewEventTypeInput = document.getElementById('review-event-type');
    const reviewRatingInput = document.getElementById('review-rating-val');
    const reviewMessageInput = document.getElementById('review-message');
    const reviewPhotoInput = document.getElementById('review-photo-input');
    const reviewSuccessOverlay = document.getElementById('review-success-banner');
    const reviewSuccessClose = document.getElementById('review-success-close-btn');
    const reviewSubmitBtn = document.getElementById('review-submit-btn');
    const reviewsFeedContainer = document.getElementById('reviews-feed-container');

    const fileChosenText = document.getElementById('file-chosen-text');
    const filePreviewContainer = document.getElementById('file-preview-container');
    const filePreviewImg = document.getElementById('file-preview-img');
    const removePreviewBtn = document.getElementById('remove-preview-btn-el');

    let uploadedPhotoBase64 = "";
    let uploadedPhotoName = "";
    let uploadedPhotoMimeType = "";

    // Default Premium Mock Reviews (Used as fallback/preview prior to backend setup)
    const MOCK_REVIEWS = [
        {
            name: "Evelyn Sterling",
            rating: 5,
            eventType: "Wedding",
            timestamp: "2026-05-18T10:30:00Z",
            message: "Moonlight Studio captured our wedding with unmatched fine-art composition. The dramatic play of shadow and golden light produced museum-quality images that we will treasure forever. Their coordination and luxury approach was elite.",
            photoUrl: ""
        },
        {
            name: "Marcus Vance",
            rating: 5,
            eventType: "Commercial",
            timestamp: "2026-06-02T14:15:00Z",
            message: "Our real estate and design portfolio campaign was shot by their architectural team. They captured structural details, materials, and natural shadows with extreme fidelity. The absolute best photography agency for commercial luxury.",
            photoUrl: ""
        },
        {
            name: "Aria Thorne",
            rating: 5,
            eventType: "Portrait",
            timestamp: "2026-06-25T11:00:00Z",
            message: "My fine-art portrait session was a highly curated experience. The director led the session with professional styling guidance, shaping visual shadows to highlight features beautifully. A deeply personal and stunning luxury portfolio.",
            photoUrl: ""
        },
        {
            name: "Julian & Clara",
            rating: 4,
            eventType: "Pre-Wedding",
            timestamp: "2026-07-01T09:45:00Z",
            message: "An absolutely stunning pre-wedding photoshoot. The outdoor scenery print compositions are breathtaking. Moonlight's team was highly professional and delivered our digital catalog exactly on schedule.",
            photoUrl: ""
        }
    ];

    // Initialize Interactive Star Rating System
    const starButtons = document.querySelectorAll('.rating-star-btn');

    starButtons.forEach(btn => {
        // Hover Enter
        btn.addEventListener('mouseenter', () => {
            const hoverVal = parseInt(btn.getAttribute('data-star-val'));
            highlightStars(hoverVal, 'hover-star');
        });

        // Hover Leave
        btn.addEventListener('mouseleave', () => {
            resetStarsHighlight();
        });

        // Click selection
        btn.addEventListener('click', () => {
            const selectedVal = parseInt(btn.getAttribute('data-star-val'));
            reviewRatingInput.value = selectedVal;

            // Trigger input validation check clear
            const parent = reviewRatingInput.closest('.form-group');
            if (parent && parent.classList.contains('error')) {
                parent.classList.remove('error');
            }

            highlightStars(selectedVal, 'active-star');
        });
    });

    function highlightStars(rating, className) {
        starButtons.forEach(btn => {
            const starVal = parseInt(btn.getAttribute('data-star-val'));
            const icon = btn.querySelector('i');

            if (starVal <= rating) {
                btn.classList.add(className);
                if (icon) {
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                }
            } else {
                if (className === 'active-star') {
                    btn.classList.remove('active-star');
                    if (icon) {
                        icon.classList.remove('fa-solid');
                        icon.classList.add('fa-regular');
                    }
                } else {
                    btn.classList.remove('hover-star');
                }
            }
        });
    }

    function resetStarsHighlight() {
        const activeVal = parseInt(reviewRatingInput.value) || 0;

        starButtons.forEach(btn => {
            btn.classList.remove('hover-star');
            const starVal = parseInt(btn.getAttribute('data-star-val'));
            const icon = btn.querySelector('i');

            if (starVal <= activeVal) {
                btn.classList.add('active-star');
                if (icon) {
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                }
            } else {
                btn.classList.remove('active-star');
                if (icon) {
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                }
            }
        });
    }

    // Photo File Reader and Preview Handler
    if (reviewPhotoInput) {
        reviewPhotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Simple size/type check
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file (PNG, JPG, WEBP).');
                clearPhotoSelection();
                return;
            }

            uploadedPhotoName = file.name;
            uploadedPhotoMimeType = file.type;
            fileChosenText.textContent = file.name;

            const reader = new FileReader();
            reader.onload = (evt) => {
                uploadedPhotoBase64 = evt.target.result;
                filePreviewImg.src = evt.target.result;
                filePreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        });
    }

    if (removePreviewBtn) {
        removePreviewBtn.addEventListener('click', () => {
            clearPhotoSelection();
        });
    }

    function clearPhotoSelection() {
        reviewPhotoInput.value = "";
        uploadedPhotoBase64 = "";
        uploadedPhotoName = "";
        uploadedPhotoMimeType = "";
        fileChosenText.textContent = "Choose Image...";
        filePreviewContainer.style.display = 'none';
        filePreviewImg.src = "";
    }

    // Load & Render Approved Reviews
    function loadReviews() {
        if (!APPS_SCRIPT_URL) {
            console.log("No APPS_SCRIPT_URL configured. Displaying premium mock reviews.");
            renderReviews(MOCK_REVIEWS);
            return;
        }

        // Display loader text in reviews box initially
        reviewsFeedContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--accent-gold); margin-bottom: 15px;"></i>
                <p>Loading curated reviews...</p>
            </div>
        `;

        fetch(APPS_SCRIPT_URL)
            .then(res => res.json())
            .then(data => {
                if (data.status === "success" && data.reviews && data.reviews.length > 0) {
                    renderReviews(data.reviews);
                } else {
                    console.log("No approved reviews returned from server. Falling back to mock data.");
                    renderReviews(MOCK_REVIEWS);
                }
            })
            .catch(err => {
                console.error("Error loading reviews from database:", err);
                renderReviews(MOCK_REVIEWS); // Fallback on error
            });
    }

    // Compile Ratings Statistics Summary
    function compileStatistics(reviews) {
        const total = reviews.length;
        if (total === 0) return;

        let sum = 0;
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        reviews.forEach(rev => {
            const r = Math.min(5, Math.max(1, parseInt(rev.rating) || 5));
            sum += r;
            counts[r]++;
        });

        const avg = sum / total;

        // Update values in HTML
        document.getElementById('stats-avg-val').textContent = avg.toFixed(1);
        document.getElementById('stats-count-val').textContent = `Based on ${total} reviews`;

        // Render dynamic stars in overview card
        const starsBox = document.getElementById('stats-stars-box');
        starsBox.innerHTML = "";
        const roundedAvg = Math.round(avg * 2) / 2; // Round to nearest 0.5
        for (let i = 1; i <= 5; i++) {
            if (i <= roundedAvg) {
                starsBox.innerHTML += `<i class="fa-solid fa-star text-gold"></i>`;
            } else if (i - 0.5 === roundedAvg) {
                starsBox.innerHTML += `<i class="fa-solid fa-star-half-stroke text-gold"></i>`;
            } else {
                starsBox.innerHTML += `<i class="fa-regular fa-star text-gold"></i>`;
            }
        }

        // Update progress bars breakdown
        for (let star = 5; star >= 1; star--) {
            const percentage = Math.round((counts[star] / total) * 100);
            const fill = document.getElementById(`bar-${star}-fill`);
            const countLabel = document.getElementById(`bar-${star}-count`);

            if (fill) fill.style.width = `${percentage}%`;
            if (countLabel) countLabel.textContent = `${percentage}%`;
        }
    }

    // Render Review Cards
    function renderReviews(reviews) {
        // Sort reviews by date descending
        const sorted = [...reviews].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        reviewsFeedContainer.innerHTML = "";

        sorted.forEach(rev => {
            const dateObj = new Date(rev.timestamp);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });

            // Generate stars HTML
            let starsHtml = "";
            for (let i = 1; i <= 5; i++) {
                if (i <= rev.rating) {
                    starsHtml += `<i class="fa-solid fa-star text-gold" style="font-size: 0.8rem;"></i>`;
                } else {
                    starsHtml += `<i class="fa-regular fa-star text-gold" style="font-size: 0.8rem;"></i>`;
                }
            }

            // Avatar photo HTML
            let avatarHtml = "";
            if (rev.photoUrl) {
                avatarHtml = `<img src="${rev.photoUrl}" alt="${rev.name}" class="reviewer-avatar">`;
            } else {
                // Return generic initials mark
                const initials = rev.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                avatarHtml = `<div class="reviewer-avatar-placeholder">${initials}</div>`;
            }

            const card = document.createElement('div');
            card.className = "review-card animate-on-scroll fade-up revealed";
            card.innerHTML = `
                <div class="review-card-header">
                    <div class="reviewer-profile-box">
                        ${avatarHtml}
                        <div class="reviewer-meta">
                            <span class="reviewer-name">${escapeHTML(rev.name)}</span>
                            <span class="review-event-badge">${escapeHTML(rev.eventType)}</span>
                        </div>
                    </div>
                    <div class="review-rating-date">
                        <div class="stars-display">
                            ${starsHtml}
                        </div>
                        <span class="review-date">${formattedDate}</span>
                    </div>
                </div>
                <p class="review-body-text">"${escapeHTML(rev.message)}"</p>
            `;
            reviewsFeedContainer.appendChild(card);
        });

        compileStatistics(sorted);
    }

    // Helper: Escape user input to avoid XSS injections
    function escapeHTML(str) {
        if (!str) return "";
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // General Fields Reset
    [reviewNameInput, reviewEmailInput, reviewPhoneInput, reviewEventTypeInput, reviewMessageInput].forEach(input => {
        if (input) {
            ['input', 'change'].forEach(evtName => {
                input.addEventListener(evtName, () => {
                    const parent = input.closest('.form-group');
                    if (parent && parent.classList.contains('error')) {
                        parent.classList.remove('error');
                    }
                });
            });
        }
    });

    // Review Submit Handler
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Run validation
            const isNameValid = checkContactField(reviewNameInput);
            const isEmailValid = checkContactField(reviewEmailInput, validateEmail);
            const isEventTypeValid = checkContactField(reviewEventTypeInput);
            const isMessageValid = checkContactField(reviewMessageInput);

            // Custom rating check
            let isRatingValid = true;
            const ratingVal = reviewRatingInput.value.trim();
            const ratingParent = reviewRatingInput.closest('.form-group');
            if (ratingVal === "" || parseInt(ratingVal) < 1 || parseInt(ratingVal) > 5) {
                isRatingValid = false;
                if (ratingParent) ratingParent.classList.add('error');
            } else {
                if (ratingParent) ratingParent.classList.remove('error');
            }

            if (isNameValid && isEmailValid && isEventTypeValid && isRatingValid && isMessageValid) {
                // Initiate submit spinner animation
                reviewSubmitBtn.classList.add('submitting');
                reviewSubmitBtn.disabled = true;

                const payload = {
                    name: reviewNameInput.value.trim(),
                    email: reviewEmailInput.value.trim(),
                    phone: reviewPhoneInput.value.trim() || "",
                    eventType: reviewEventTypeInput.value.trim(),
                    rating: parseInt(ratingVal),
                    message: reviewMessageInput.value.trim(),
                    photoData: uploadedPhotoBase64,
                    photoName: uploadedPhotoName,
                    photoMimeType: uploadedPhotoMimeType
                };

                if (!APPS_SCRIPT_URL) {
                    // Pre-setup local mock success transition delay
                    setTimeout(() => {
                        reviewSubmitBtn.classList.remove('submitting');
                        reviewSubmitBtn.disabled = false;

                        // Show success banner
                        reviewSuccessOverlay.classList.add('open');
                    }, 1200);
                } else {
                    // Send to deployed Web App backend
                    fetch(APPS_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors', // standard workaround for Apps Script redirect block
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    })
                        .then(() => {
                            // 'no-cors' resolves opaque responses successfully, so treat as done
                            reviewSubmitBtn.classList.remove('submitting');
                            reviewSubmitBtn.disabled = false;
                            reviewSuccessOverlay.classList.add('open');
                        })
                        .catch(err => {
                            console.error("Error submitting review to sheet database:", err);
                            alert("We encountered a connectivity issue submitting your review. Reverting to email backup.");

                            // Fallback backup: mailto link
                            const email = "moonlightstudioandphotography@gmail.com";
                            const mailtoSubject = encodeURIComponent(`Client Review [${payload.eventType}]`);
                            const mailtoBody = encodeURIComponent(
                                `Full Name: ${payload.name}\n` +
                                `Email: ${payload.email}\n` +
                                `Rating: ${payload.rating} Stars\n` +
                                `Event Type: ${payload.eventType}\n\n` +
                                `Message:\n${payload.message}`
                            );
                            window.location.href = `mailto:${email}?subject=${mailtoSubject}&body=${mailtoBody}`;

                            reviewSubmitBtn.classList.remove('submitting');
                            reviewSubmitBtn.disabled = false;
                            reviewSuccessOverlay.classList.add('open');
                        });
                }
            }
        });
    }

    if (reviewSuccessClose) {
        reviewSuccessClose.addEventListener('click', () => {
            // Reset all elements
            reviewForm.reset();
            clearPhotoSelection();
            reviewRatingInput.value = "";
            resetStarsHighlight();

            // Clear errors
            document.querySelectorAll('.review-form-panel .form-group').forEach(group => {
                group.classList.remove('error');
            });

            // Close success overlay
            reviewSuccessOverlay.classList.remove('open');
        });
    }

    // Trigger load of reviews when page is accessed/hash changes
    window.addEventListener('hashchange', () => {
        if (window.location.hash === '#reviews') {
            loadReviews();
        }
    });

    // Check hash on initial load
    if (window.location.hash === '#reviews') {
        loadReviews();
    }


    // ==========================================================================
    // 13. SCROLL EVENTS (Indicator & Header Sticky styling)
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
