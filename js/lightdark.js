const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");

const getCurrentTheme = () => (root.getAttribute("data-theme") === "dark" ? "dark" : "light");

const updateToggleLabel = () => {
    if (!toggle) return;
    const theme = getCurrentTheme();
    const nextLabel = theme === "dark" ? "\u26AA\uFE0F light mode" : "\u26AB\uFE0F dark mode";
    toggle.textContent = nextLabel;
    toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    toggle.setAttribute("data-active-theme", theme);
};

const persistTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    try {
        localStorage.setItem("theme", theme);
    } catch (err) {
        console.warn("Unable to save theme preference:", err);
    }
    updateToggleLabel();
};

if (toggle) {
    updateToggleLabel();
    toggle.addEventListener("click", () => {
        const next = getCurrentTheme() === "dark" ? "light" : "dark";
        persistTheme(next);
    });
}

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
mediaQuery.addEventListener("change", (event) => {
    const storedTheme = (() => {
        try {
            return localStorage.getItem("theme");
        } catch {
            return null;
        }
    })();

    if (storedTheme) {
        return;
    }

    persistTheme(event.matches ? "dark" : "light");
});