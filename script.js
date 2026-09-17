/*
   script.js - AI Portfolio Interaction Script
   Designed for Prithvi sagar Ganesh
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            // Toggle hamburger icon between open / closed if needed
            const isOpen = navMenu.classList.contains('open');
            menuToggle.innerHTML = isOpen ? '&#10005;' : '&#9776;'; // ✕ or ☰
        });

        // Close menu when clicking a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                menuToggle.innerHTML = '&#9776;'; // Reset to ☰
            });
        });
    }

    // --- Active Link Highlight on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function highlightNavigation() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100; // Account for header height
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);

    // --- Contact Form Simulation ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop page reload

            // Get form values
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const message = document.getElementById('form-message').value.trim();

            if (!name || !email || !message) {
                formStatus.textContent = 'Please fill out all fields.';
                formStatus.className = 'form-status error';
                return;
            }

            // Show loading or immediate success
            formStatus.textContent = 'Sending message...';
            formStatus.className = 'form-status';

            // Simulate server network request delay
            setTimeout(() => {
                formStatus.textContent = `Thank you, ${name}! Your message has been sent successfully. (Simulation)`;
                formStatus.className = 'form-status success';
                contactForm.reset();
            }, 1000);
        });
    }

    // --- Testimonials (shared across all visitors via GitHub Issues) ---
    // This is a static site with no backend/database, so genuinely shared,
    // public testimonials are collected via GitHub Issues on this repo:
    // - "Leave a Testimonial" opens a pre-filled New Issue form on GitHub.
    //   The visitor needs a free GitHub account to submit (no account =
    //   no way to write shared public data from a static site without one).
    // - This page then reads those issues back via GitHub's public REST API
    //   (no auth required for a public repo) and renders them for everyone.
    const GITHUB_OWNER = 'prithvismoni10-cpu';
    const GITHUB_REPO = 'prithvi-ai-portfolio';
    const TESTIMONIAL_LABEL = 'testimonial';

    const testimonialsLoading = document.getElementById('testimonials-loading');
    const testimonialsEmpty = document.getElementById('testimonials-empty');
    const testimonialsError = document.getElementById('testimonials-error');
    const testimonialsGrid = document.getElementById('testimonials-grid');
    const testimonialGithubLink = document.getElementById('testimonial-github-link');

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function showTestimonialState(state) {
        [testimonialsLoading, testimonialsEmpty, testimonialsError, testimonialsGrid].forEach(el => {
            if (el) el.style.display = 'none';
        });
        if (state === 'grid') {
            testimonialsGrid.style.display = 'grid';
        } else if (state === 'empty') {
            testimonialsEmpty.style.display = 'block';
        } else if (state === 'error') {
            testimonialsError.style.display = 'block';
        } else {
            testimonialsLoading.style.display = 'block';
        }
    }

    if (testimonialGithubLink) {
        const issueTitle = 'Testimonial';
        const issueBody = [
            '**Name:** ',
            '',
            '**Role / Company (optional):** ',
            '',
            '**Your remarks:**',
            'Share your experience working with Prithvi...'
        ].join('\n');

        const newIssueUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues/new?` +
            `labels=${encodeURIComponent(TESTIMONIAL_LABEL)}` +
            `&title=${encodeURIComponent(issueTitle)}` +
            `&body=${encodeURIComponent(issueBody)}`;

        testimonialGithubLink.href = newIssueUrl;
    }

    if (testimonialsGrid) {
        showTestimonialState('loading');

        const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues` +
            `?labels=${encodeURIComponent(TESTIMONIAL_LABEL)}&state=all&sort=created&direction=desc&per_page=30`;

        fetch(apiUrl, { headers: { Accept: 'application/vnd.github+json' } })
            .then(res => {
                if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
                return res.json();
            })
            .then(issues => {
                // The issues endpoint also returns pull requests; exclude those.
                const testimonials = issues.filter(issue => !issue.pull_request);

                if (!testimonials.length) {
                    showTestimonialState('empty');
                    return;
                }

                testimonialsGrid.innerHTML = testimonials.map(issue => {
                    const author = issue.user || {};
                    const date = new Date(issue.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                    });
                    return `
                        <div class="testimonial-card">
                            <div class="testimonial-quote-mark">&ldquo;</div>
                            <p class="testimonial-message">${escapeHtml(issue.body || '')}</p>
                            <a class="testimonial-author" href="${author.html_url || issue.html_url}" target="_blank" rel="noopener noreferrer">
                                ${escapeHtml(author.login || 'Anonymous')}
                            </a>
                            <div class="testimonial-role">${date} &middot; <a href="${issue.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a></div>
                        </div>
                    `;
                }).join('');

                showTestimonialState('grid');
            })
            .catch(() => {
                showTestimonialState('error');
            });
    }
});
