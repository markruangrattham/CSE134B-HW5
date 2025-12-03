class ProjectCard extends HTMLElement {
    set data(card) {
        this.innerHTML = `
            <h3>
                ${card.title}<br>
                <span style="font-size: 1rem; font-weight: normal;">
                    ${card.date}
                </span>
            </h3>

            <p>${card.description}</p>

            ${this.renderMedia(card.media)}

            <project-details>
                ${card.status ? `<p><strong>Status:</strong> ${card.status}</p>` : ""}
                ${card.features ? `<p><strong>Features:</strong> ${card.features}</p>` : ""}

                ${
                    card.tools?.length
                        ? `<ul class="tools" aria-label="Tools used">
                            ${card.tools
                                .map(tool => `<li class="tool" title="${tool}">${tool}</li>`)
                                .join("")}
                           </ul>`
                        : ""
                }
                ${card.link ? `<div style="margin-top: 1rem; text-align: center;"><a href="${card.link}" class="project-link-button">Read More</a></div>` : ''}
            </project-details>
        `;
    }

    renderMedia(media) {
        if (!media) return "";

        if (media.type === "iframe") {
            return `
                <iframe
                    src="${media.src}"
                    title="${media.title}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen>
                </iframe>
            `;
        }

        const sources = (media.sources || [])
            .map(s => `<source srcset="${s.srcset}" type="${s.type}">`)
            .join("");

        return `
            <picture>
                ${sources}
                <img src="${media.src}" alt="${media.alt}">
            </picture>
        `;
    }
}

customElements.define("project-card", ProjectCard);

const projects = [
    {
        id: "card1",
        title: "Leafybucks",
        date: "July 2025 - Present",
        description:
            "I need to be better at managing my money, so I thought why not build a nice little web app for this that can track my expenses and see how much I'm spending on doordash each month.",
        status: "In Development",
        features:
            "Expense tracking, budget management, category analysis, and spending trends visualization.",
        media: {
            type: "image",
            sources: [
                {
                    srcset:
                        "img/projects/leafybucks-640.webp 640w, img/projects/leafybucks-1280.webp 1280w, img/projects/leafybucks-1535.webp 1535w",
                    type: "image/webp"
                }
            ],
            src: "img/projects/leafybucks-1535.webp",
            alt: "Leafybucks screenshot"
        },
        tools: ["GCloud", "React"],
        link: "leafybucks.html"
    },
    {
        id: "card2",
        title: "Study Genius",
        date: "April 2025",
        description:
            "My very first hackathon project. 24 hours to build a web application to help you study for your exams faster and more efficiently.",
        status: "Completed",
        features:
            "ChatGPT-powered flashcard generation backed by Firestore.",
        media: {
            type: "iframe",
            src: "https://www.youtube.com/embed/xdCblU1HOhE",
            title: "Study Genius demo"
        },
        tools: ["React", "Firestore", "ChatGPT"],
        link: "study-genius.html"
    },
    {
        id: "card3",
        title: "FÚTBOL DEX",
        date: "August 2025 - Present",
        description:
            "A Discord bot that my friend was getting bored of, so they asked me if I could make a better one. Challenge accepted.",
        status: "Beta Testing Phase",
        features:
            "GCloud-powered bot with a Django website and custom API endpoints so designers can upload cards from the site and the bot can spawn them randomly.",
        media: {
            type: "image",
            sources: [
                {
                    srcset:
                        "img/projects/futdex-640.webp 640w, img/projects/futdex-1080.webp 1080w",
                    type: "image/webp"
                }
            ],
            src: "img/projects/futdex.jpg",
            alt: "FÚTBOL DEX screenshot"
        },
        tools: ["Django", "API", "GCloud"],
        link: "futbol-dex.html"
    },
    {
        id: "card4",
        title: "Valhalla World Cup Spinner",
        date: "January 2025",
        description:
            "A fun event tool I vibe-coded one night for the Valhalla FC community to assign random World Cup countries to players.",
        status: "Completed",
        features:
            "React frontend and Python backend connected to a database of players. Shows their Discord icon and assigns a random country, then saves the result.",
        media: {
            type: "image",
            sources: [
                {
                    srcset: "img/projects/flag-spinner-fixed-640.gif 640w",
                    type: "image/gif"
                }
            ],
            src: "img/projects/flag_spinner.gif",
            alt: "Valhalla World Cup Spinner"
        },
        tools: ["React", "Python", "Discord"],
        link: "valhalla-spinner.html"
    },
    {
        id: "card5",
        title: "Birthday Countdown",
        date: "October 2024",
        description:
            "A gift for my girlfriend: a countdown timer that reveals a secret video when it hits zero, with music built in.",
        status: "Completed",
        features:
            "React-based countdown that updates every second and shows a hidden video when finished.",
        media: {
            type: "image",
            sources: [
                {
                    srcset: "img/projects/bb-birthday-fixed-640.gif 640w",
                    type: "image/gif"
                }
            ],
            src: "img/projects/bb birthday.gif",
            alt: "Birthday countdown app"
        },
        tools: ["React", "HTML", "CSS", "JavaScript"],
        link: "birthday-countdown.html"
    },
    {
        id: "card6",
        title: "Premier League Match Predictor",
        date: "October 2025 - Present",
        description:
            "Massive football fan so I started building a model to predict Premier League match outcomes using recent form and injuries.",
        status: "Planning Phase",
        features:
            "Predicts match outcomes based on team performance data using simple ML models.",
        media: {
            type: "image",
            sources: [
                {
                    srcset:
                        "img/projects/premier-league-640.webp 640w, img/projects/premier-league-900.webp 900w",
                    type: "image/webp"
                }
            ],
            src: "img/projects/premier league.jpg",
            alt: "Premier League predictor project"
        },
        tools: ["Python", "PyTorch"],
        link: "pl-predictor.html"
    }
];

// Part 1: Dynamically create project cards when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const projectsSection = document.getElementById("projects-section");
    if (!projectsSection) return;

    projectsSection.innerHTML = "";

    projects.forEach(project => {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = project.id;
        input.className = "card-toggle";

        const label = document.createElement("label");
        label.setAttribute("for", project.id);
        label.setAttribute("data-card", "");

        const card = document.createElement("project-card");
        card.data = project;

        label.appendChild(card);
        projectsSection.appendChild(input);
        projectsSection.appendChild(label);
    });
});

