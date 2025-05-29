// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded. Initializing scripts...');

    // --- Mobile Navigation Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('nav ul');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            console.log('Mobile nav toggled.');
        });
    }

    // --- Active Page Highlight in Navigation ---
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        const linkPath = link.href.split('/').pop();
        if (currentPath === linkPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.add('active-page');
            console.log(`Active page highlighted: ${linkPath}`);
        }
    });

    // --- Smooth Page Transitions ---
    const internalNavLinks = document.querySelectorAll('nav ul li a[href^="/"], nav ul li a[href^="./"], nav ul li a[href^="../"]');

    internalNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetUrl = this.href;

            const isDifferentPage = (targetUrl !== window.location.href) &&
                                    !(currentPath === '' && targetUrl.endsWith('index.html'));

            if (isDifferentPage) {
                e.preventDefault();
                console.log(`Navigating to: ${targetUrl} with animation.`);
                document.body.classList.add('page-exit');

                const mainContent = document.querySelector('main');
                if (mainContent) {
                    const animationDuration = 800;

                    const handleAnimationEnd = () => {
                        mainContent.removeEventListener('animationend', handleAnimationEnd);
                        window.location.href = targetUrl;
                    };

                    mainContent.addEventListener('animationend', handleAnimationEnd, { once: true });

                    setTimeout(() => {
                        if (window.location.href !== targetUrl) {
                             window.location.href = targetUrl;
                        }
                    }, animationDuration + 50);
                } else {
                    console.warn("Main content element not found for animation. Navigating directly.");
                    window.location.href = targetUrl;
                }
            }
        });
    });


    // --- Dynamic Gallery Population & Filtering (on gallery.html) ---
    const photoGrid = document.getElementById('photo-grid');
    const filterButtonsContainer = document.querySelector('.filter-buttons');

    // Only run gallery logic if photoGrid element exists (i.e., on gallery.html)
    // and galleryItems from gallery-data.js is loaded
    if (photoGrid && typeof galleryItems !== 'undefined' && galleryItems.length > 0) {
        console.log('Gallery section found. Populating images...');

        // Function to render gallery items onto the page
        function renderGallery(itemsToRender) {
            console.log(`Rendering ${itemsToRender.length} gallery items.`);
            photoGrid.innerHTML = '';
            if (itemsToRender.length === 0) {
                photoGrid.innerHTML = '<p>No photos found for this category.</p>';
                return;
            }
            itemsToToRender.forEach(item => {
                const figure = document.createElement('figure');
                figure.classList.add('gallery-item');
                figure.setAttribute('data-category', item.category);
                figure.innerHTML = `
                    <img src="${item.src}" alt="${item.alt}">
                    <figcaption>${item.caption}</figcaption>
                `;
                photoGrid.appendChild(figure);
            });
        }

        // Initial render of all items when the gallery page loads
        renderGallery(galleryItems);

        // --- Gallery Filtering Logic (Using Event Delegation) ---
        if (filterButtonsContainer) {
            console.log('Filter buttons container found. Attaching event listener.');
            filterButtonsContainer.addEventListener('click', (event) => {
                const clickedButton = event.target.closest('.filter-btn');

                if (clickedButton) {
                    const filter = clickedButton.dataset.filter;
                    console.log(`Filter button clicked: ${filter}`);

                    // Update active button state
                    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                    clickedButton.classList.add('active');

                    if (filter === 'all') {
                        renderGallery(galleryItems);
                    } else {
                        const filteredItems = galleryItems.filter(item => item.category === filter);
                        renderGallery(filteredItems);
                    }
                }
            });
        } else {
            console.warn('Filter buttons container not found on gallery page.');
        }

        // --- Image Lightbox Logic (Using Event Delegation) ---
        let lightboxOverlay = document.querySelector('.lightbox-overlay');
        if (!lightboxOverlay) {
            console.log('Creating lightbox overlay elements.');
            lightboxOverlay = document.createElement('div');
            lightboxOverlay.classList.add('lightbox-overlay');
            lightboxOverlay.innerHTML = `
                <div class="lightbox-content">
                    <span class="lightbox-close">&times;</span>
                    <img src="" alt="Full size image">
                </div>
            `;
            document.body.appendChild(lightboxOverlay);
        }

        const lightboxImage = lightboxOverlay.querySelector('img');
        const lightboxClose = lightboxOverlay.querySelector('.lightbox-close');

        photoGrid.addEventListener('click', (event) => {
            const clickedGalleryItem = event.target.closest('.gallery-item');

            if (clickedGalleryItem) {
                const imgSrc = clickedGalleryItem.querySelector('img').src;
                const imgAlt = clickedGalleryItem.querySelector('img').alt;
                console.log(`Gallery item clicked. Opening lightbox for: ${imgSrc}`);

                lightboxImage.src = imgSrc;
                lightboxImage.alt = imgAlt;
                lightboxOverlay.style.display = 'flex';
            }
        });


        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => {
                console.log('Lightbox close button clicked.');
                lightboxOverlay.style.display = 'none';
            });
        }

        if (lightboxOverlay) {
            lightboxOverlay.addEventListener('click', (e) => {
                if (e.target === lightboxOverlay) {
                    console.log('Lightbox overlay clicked outside image. Closing lightbox.');
                    lightboxOverlay.style.display = 'none';
                }
            });
        }

    } else if (window.location.pathname.includes('gallery.html')) {
        console.error('Gallery section or galleryItems data not properly loaded/found on gallery.html.');
        if (!photoGrid) console.error('Error: photoGrid element not found.');
        if (typeof galleryItems === 'undefined') console.error('Error: galleryItems array is undefined. Check gallery-data.js load order or path.');
        if (typeof galleryItems !== 'undefined' && galleryItems.length === 0) console.error('Error: galleryItems array is empty.');
    } // End of gallery.html specific logic

    // --- Contact Form Validation (on contact.html) ---
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        console.log('Contact form found. Attaching validation listener.');
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            let isValid = true;
            let errorMessage = '';

            if (name === '') {
                errorMessage += 'Name is required.\n';
                isValid = false;
            }

            if (email === '') {
                errorMessage += 'Email is required.\n';
                isValid = false;
            } else if (!/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/.test(email)) {
                errorMessage += 'Please enter a valid email address.\n';
                isValid = false;
            }

            if (message === '') {
                errorMessage += 'Message is required.\n';
                isValid = false;
            }

            if (!isValid) {
                alert('Please correct the following errors:\n' + errorMessage);
                console.warn('Contact form validation failed.');
            } else {
                alert('Thank you for your message! We will get back to you soon. (Note: This is a client-side only submission)');
                contactForm.reset();
                console.log('Contact form submitted successfully (client-side).');
            }
        });
    }

}); // End of DOMContentLoaded