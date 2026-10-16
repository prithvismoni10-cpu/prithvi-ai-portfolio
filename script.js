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

    // --- Service Selection ---
    // Clients pick services from the cards (or the form checkboxes). Both stay in sync,
    // and the selection is summarised beside the form and in a floating bar.
    const serviceCards = Array.from(document.querySelectorAll('.service-card'));
    const checkboxWrap = document.getElementById('service-checkboxes');
    const selectionList = document.getElementById('selection-list');
    const selectionEmpty = document.getElementById('selection-empty');
    const selectionBar = document.getElementById('selection-bar');
    const selectionBarText = document.getElementById('selection-bar-text');
    const selected = new Set();
    let contactInView = false;
    const STORAGE_KEY = 'psg-selected-services';

    const services = serviceCards.map(card => ({
        id: card.dataset.service,
        title: card.dataset.title,
        card
    }));
    const titleOf = id => (services.find(s => s.id === id) || {}).title || id;

    if (checkboxWrap) {
        checkboxWrap.innerHTML = services.map(s => `
            <label class="service-check">
                <input type="checkbox" name="services" value="${s.id}">
                <span>${s.title}</span>
            </label>`).join('') + `
            <label class="service-check">
                <input type="checkbox" name="services" value="other">
                <span>Something else / not sure</span>
            </label>`;
        checkboxWrap.addEventListener('change', e => {
            if (e.target.name !== 'services') return;
            toggleService(e.target.value, e.target.checked);
        });
    }

    function renderSelection() {
        services.forEach(s => {
            const on = selected.has(s.id);
            s.card.classList.toggle('selected', on);
            const btn = s.card.querySelector('.btn-select');
            if (btn) {
                btn.setAttribute('aria-pressed', on ? 'true' : 'false');
                btn.querySelector('.select-label').textContent = on ? '✓ Added to my project' : '+ Add to my project';
            }
        });
        if (checkboxWrap) {
            checkboxWrap.querySelectorAll('input[name="services"]').forEach(cb => {
                cb.checked = selected.has(cb.value);
            });
        }
        if (selectionList) {
            selectionList.innerHTML = Array.from(selected).map(id => `
                <li><span>${id === 'other' ? 'Something else / not sure' : titleOf(id)}</span>
                <button type="button" class="selection-remove" data-remove="${id}" aria-label="Remove">✕</button></li>`).join('');
        }
        if (selectionEmpty) selectionEmpty.style.display = selected.size ? 'none' : 'block';
        if (selectionBar) {
            selectionBarText.textContent = `${selected.size} service${selected.size === 1 ? '' : 's'} selected`;
            selectionBar.classList.toggle('visible', selected.size > 0 && !contactInView);
        }
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selected))); } catch (e) { /* storage unavailable */ }
    }

    function toggleService(id, force) {
        const on = typeof force === 'boolean' ? force : !selected.has(id);
        if (on) selected.add(id); else selected.delete(id);
        renderSelection();
    }

    serviceCards.forEach(card => {
        const btn = card.querySelector('.btn-select');
        if (btn) btn.addEventListener('click', () => toggleService(card.dataset.service));
    });

    if (selectionList) {
        selectionList.addEventListener('click', e => {
            const id = e.target.dataset && e.target.dataset.remove;
            if (id) toggleService(id, false);
        });
    }

    // Hide the floating bar while the request form is on screen
    const contactSection = document.getElementById('contact');
    if (contactSection && 'IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            contactInView = entries[0].isIntersecting;
            renderSelection();
        }, { threshold: 0.15 }).observe(contactSection);
    }

    // Restore a previous selection for returning visitors
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (Array.isArray(saved)) saved.forEach(id => selected.add(id));
    } catch (e) { /* storage unavailable */ }
    renderSelection();

    // --- Project Request Form ---
    // Sent with FormSubmit (free, no backend needed). The very first submission
    // triggers a one-time activation email to the address below; click the link
    // in that email and every later request arrives in the inbox automatically.
    const REQUEST_EMAIL = 'justbeingcreative07@gmail.com';
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('form-submit-btn');

    function setStatus(msg, type, html) {
        if (html) formStatus.innerHTML = msg; else formStatus.textContent = msg;
        formStatus.className = 'form-status ' + (type || 'info');
    }

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const val = id => (document.getElementById(id)?.value || '').trim();
            const name = val('form-name');
            const email = val('form-email');
            const message = val('form-message');
            const chosen = Array.from(selected).map(id => id === 'other' ? 'Something else / not sure' : titleOf(id));

            if (!name || !email || !message) {
                setStatus('Please add your name, email, and a few project details.', 'error');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setStatus('Please enter a valid email address.', 'error');
                return;
            }
            if (!chosen.length) {
                setStatus('Please select at least one service.', 'error');
                return;
            }
            if (contactForm.querySelector('.honeypot').value) return; // bot

            const payload = {
                _subject: `New project request from ${name}: ${chosen.join(', ')}`,
                _template: 'table',
                _captcha: 'false',
                Name: name,
                Email: email,
                Company: val('form-company') || 'Not provided',
                Phone: val('form-phone') || 'Not provided',
                Services: chosen.join(', '),
                'Engagement type': val('form-engagement'),
                Budget: val('form-budget'),
                Timeline: val('form-timeline'),
                'Preferred contact': (contactForm.querySelector('input[name="contact_preference"]:checked') || {}).value || '',
                'Project details': message,
                _replyto: email
            };

            const mailBody = Object.entries(payload)
                .filter(([k]) => !k.startsWith('_'))
                .map(([k, v]) => `${k}: ${v}`).join('\n');
            const mailtoUrl = `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(mailBody)}`;

            submitBtn.disabled = true;
            setStatus('Sending your request...', 'info');

            fetch(`https://formsubmit.co/ajax/${REQUEST_EMAIL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(res => res.json().then(data => ({ ok: res.ok, data })))
                .then(({ ok, data }) => {
                    if (!ok || String(data.success) === 'false') throw new Error(data.message || 'Send failed');
                    setStatus(`Thank you, ${name}! Your request for ${chosen.length} service${chosen.length === 1 ? '' : 's'} has been sent. I will reply within 24 hours.`, 'success');
                    contactForm.reset();
                    selected.clear();
                    renderSelection();
                })
                .catch(() => {
                    setStatus(`The form could not send right now. <a href="${mailtoUrl}">Click here to send it by email instead</a>; your details are already filled in.`, 'error', true);
                })
                .finally(() => { submitBtn.disabled = false; });
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
            'Which service did you use, and how did the project go?'
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
