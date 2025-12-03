(() => {
    const supportsViewTransitions = typeof document.startViewTransition === "function";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const shouldSkip = () => !supportsViewTransitions || prefersReducedMotion.matches;

    const safeStartTransition = (callback) => {
        if (shouldSkip()) {
            callback();
            return;
        }
        document.startViewTransition(() => {
            callback();
        });
    };

    const navLinks = document.querySelectorAll(
        "#main-nav a[href$='.html']:not([target='_blank'])"
    );

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const url = new URL(link.href, window.location.href);
            if (url.pathname === window.location.pathname) {
                return;
            }

            event.preventDefault();
            safeStartTransition(() => {
                window.location.href = url.href;
            });
        });
    });

    const toggles = document.querySelectorAll(".card-toggle");

    const updateBodyState = () => {
        const opened = Array.from(toggles).some((toggle) => toggle.checked);
        document.body.classList.toggle("is-card-open", opened);

        document.querySelectorAll("[data-card]").forEach((label) => {
            const input = document.getElementById(label.getAttribute("for"));
            label.classList.toggle("card-active", Boolean(input?.checked));
        });
    };

    toggles.forEach((toggle) => {
        const label = document.querySelector(`label[for='${toggle.id}']`);
        if (!label) return;

        label.addEventListener("click", (event) => {
            const performToggle = () => {
                toggle.checked = !toggle.checked;
                updateBodyState();
            };

            if (shouldSkip()) {
                performToggle();
                return;
            }

            event.preventDefault();
            safeStartTransition(performToggle);
        });
    });

    updateBodyState();

    prefersReducedMotion.addEventListener("change", (event) => {
        if (!event.matches) {
            return;
        }
    });
})();

