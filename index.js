/* Marcus Oji - portfolio interactions */
(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- custom cursor ---------- */
    const ring = document.getElementById('cursorRing');
    const dot = document.getElementById('cursorDot');
    if (ring && dot && window.matchMedia('(pointer: fine)').matches && !prefersReduced) {
        let mx = 0, my =  0, rx =  0, ry =  0;
        window.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        });
        const loop = () => {
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;
            ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
        const hoverables = 'a, button, .project-card, input, textarea, .social-btn, .nav-cta';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverables)) ring.classList.add('hovering');
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverables)) ring.classList.remove('hovering');
        });
    }

    /* ---------- scroll progress ---------- */
    const progress = document.getElementById('scrollProgress');
    if (progress) {
        const updateProgress = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            const p = h >  0 ? (window.scrollY / h) * 100 :  0;
            progress.style.width = p + '%';
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    /* ---------- header state ---------- */
    const header = document.getElementById('siteHeader');
    const onScroll = () => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- mobile menu ---------- */
    const menuBtn = document.getElementById('menuBtn');
    const nav = document.getElementById('nav');
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            const open = nav.classList.toggle('open');
            menuBtn.setAttribute('aria-expanded', String(open));
            const icon = menuBtn.querySelector('i');
            icon.classList.toggle('fa-bars', !open);
            icon.classList.toggle('fa-times', open);
        });
    }

    /* ---------- smooth scroll (with offset) ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const id = anchor.getAttribute('href');
            if (id.length > 1) {
                const target = document.querySelector(id);
                if (target) {
                    e.preventDefault();
                    const top = target.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
                    if (nav) nav.classList.remove('open');
                    if (menuBtn) {
                        menuBtn.setAttribute('aria-expanded', 'false');
                        const icon = menuBtn.querySelector('i');
                        icon.classList.add('fa-bars');
                        icon.classList.remove('fa-times');
                    }
                }
            }
        });
    });

    /* ---------- scroll spy ---------- */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (sections.length && navLinks.length) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0.1 });
        sections.forEach(s => spy.observe(s));
    }

    /* ---------- reveal on scroll ---------- */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        revealEls.forEach(el => {
            const d = el.dataset.delay || '0';
            el.style.setProperty('--d', d);
        });
        const revealObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => revealObs.observe(el));
    }

    /* ---------- animated counters ---------- */
    const counters = document.querySelectorAll('.stat-number');
    if (counters.length) {
        const countObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const card = el.closest('.stat-card') || el;
                const target = parseInt(card.dataset.count || '0', 10);
                const suffix = card.dataset.suffix || '';
                const dur = prefersReduced ? 0 : 1400;
                const start = performance.now();
                const tick = (now) => {
                    const t = Math.min((now - start) / dur, 1);
                    const eased = 1 - Math.pow(1 - t, 3);
                    el.textContent = Math.round(eased * target) + suffix;
                    if (t < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
                countObs.unobserve(el);
            });
        }, { threshold: 0.6 });
        counters.forEach(el => countObs.observe(el));
    }

    /* ---------- skill bars ---------- */
    const skillCats = document.querySelectorAll('.skill-category');
    if (skillCats.length) {
        const skillObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('.skill-progress').forEach(bar => {
                        const item = bar.closest('.skill-item');
                        const w = item ? (item.style.getPropertyValue('--w') || '0%') : '0%';
                        bar.style.width = w;
                    });
                    skillObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.35 });
        skillCats.forEach(el => skillObs.observe(el));
    }

    /* ---------- terminal typewriter ---------- */
    const termType = document.getElementById('termType');
    if (termType && !prefersReduced) {
        const phrases = [
            'full-stack developer',
            'systems builder',
            'TypeScript + PERN stack',
            'UI/UX obsessed engineer',
            'from Delta State, Nigeria'
        ];
        let pi = 0, ci =  0, deleting = false;
        const type = () => {
            const phrase = phrases[pi];
            termType.textContent = phrase.slice(0, ci);
            if (!deleting && ci < phrase.length) {
                ci++;
                setTimeout(type, 65);
            } else if (!deleting) {
                deleting = true;
                setTimeout(type, 1600);
            } else if (ci > 0) {
                ci--;
                setTimeout(type, 28);
            } else {
                deleting = false;
                pi = (pi + 1) % phrases.length;
                setTimeout(type, 350);
            }
        };
        setTimeout(type, 2000);
    }

    /* ---------- contact form → WhatsApp ---------- */
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('userName')?.value.trim();
            const email = document.getElementById('userEmail')?.value.trim();
            const subject = document.getElementById('userSubject')?.value.trim() || 'Project Inquiry';
            const message = document.getElementById('userMessage')?.value.trim();
            if (!name || !email || !message) return;
            const text = [
                '*New Contact Form Submission*',
                '',
                '*Name:* ' + name,
                '*Email:* ' + email,
                '*Subject:* ' + subject,
                '*Message:* ' + message
            ].join('\\n');
            window.open('https://wa.me/2349042007583?text=' + encodeURIComponent(text), '_blank');
            form.reset();
        });
    }
})();
