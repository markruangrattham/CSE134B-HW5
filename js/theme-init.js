(() => {
    const root = document.documentElement;
    root.classList.remove("no-js");

    const applyTheme = (theme) => {
        if (theme === "light" || theme === "dark") {
            root.setAttribute("data-theme", theme);
            return true;
        }
        return false;
    };

    try {
        const storedTheme = localStorage.getItem("theme");
        if (applyTheme(storedTheme)) {
            return;
        }
    } catch (err) {
        console.warn("Unable to access localStorage for theme:", err);
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
})();

