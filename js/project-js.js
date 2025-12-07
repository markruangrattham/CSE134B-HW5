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
                <div style="margin-top: 1rem; text-align: center; display: flex; gap: 1rem; justify-content: center;">
                    ${card.link ? `<a href="project-view.html#${card.link}" class="project-link-button">Read More</a>` : ''}
                    ${card.liveLink ? `<a href="${card.liveLink}" target="_blank" class="project-link-button secondary">Live Demo</a>` : ''}
                </div>
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

let response = [];
let projects_api = [];

function updateProjectButtons(source) {
    const cloudBtn = document.getElementById("load-more-projects");
    const localBtn = document.getElementById("load-local-projects");
    const clearBtn = document.getElementById("clear-projects");

    if (!cloudBtn || !localBtn || !clearBtn) return;

    if (source === "Cloud") {
        cloudBtn.style.display = "none";
        localBtn.style.display = "";
        clearBtn.style.display = "";
    } else if (source === "Local") {
        cloudBtn.style.display = "";
        localBtn.style.display = "none";
        clearBtn.style.display = "";
    } else {
        cloudBtn.style.display = "";
        localBtn.style.display = "";
        clearBtn.style.display = "none";
    }
}

// Set initial button state once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    updateProjectButtons("None");
});

async function loadMoreProjects() {
    const projectsSection = document.getElementById("projects-section");

    const loadingText = document.createElement("p");
    loadingText.id = "loading-message";
    loadingText.textContent = "Currently receiving from the cloud...";
    loadingText.style.textAlign = "center";
    loadingText.style.margin = "2rem auto";
    loadingText.style.color = "var(--text-secondary)";
    projectsSection.appendChild(loadingText);

    try {
        const res = await fetch(
            "https://api.jsonbin.io/v3/b/692e3dbbae596e708f7d6edd/latest",
            {
                headers: {
                    "X-Access-Key":
                        "$2a$10$zMMw84bZNIfQfor6hZGJy.Tl04kJxhaFUTFKQFQ/9/4Ap/bcAxAlu",
                },
            }
        );

        if (!res.ok) {
            throw new Error("Failed to load projects from cloud");
        }

        const json = await res.json();
        projects_api = json.record || [];
        renderProjects();
        updateProjectButtons("Cloud");
    } catch (error) {
        console.error(error);
    } finally {
        const loadingMsg = document.getElementById("loading-message");
        if (loadingMsg) {
            loadingMsg.remove();
        }
    }
}



function renderProjects() {
    const projectsSection = document.getElementById("projects-section");
    if (!projectsSection) return;

    projectsSection.innerHTML = "";

    for (let i = 0; i < projects_api.length; i++) {
        const current_project = projects_api[i];
        
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = current_project.id;
        input.className = "card-toggle";
        
        const label = document.createElement("label");
        label.setAttribute("for", current_project.id);
        label.setAttribute("data-card", "");
        
        const card = document.createElement("project-card");
        card.data = current_project;
        
        label.appendChild(card);
        projectsSection.appendChild(input);
        projectsSection.appendChild(label);
    }
}

async function loadLocalProjects() {

    const local_projects = localStorage.getItem("local-projects");
    if (!local_projects) {
        
        let local_projects = await fetch("data/project.json")
        let data = await local_projects.json();
        localStorage.setItem("local-projects", JSON.stringify(data));
        projects_api = data;

    } else {
        console.log("local projects already fetched");
        console.log(local_projects);
        projects_api = JSON.parse(local_projects);

    }
    renderProjects();
    updateProjectButtons("Local");
    projects_api = [];
    response = [];
}

function clearProjects() {
    projects_api = [];
    response = [];
    const projectsSection = document.getElementById("projects-section");
    projectsSection.innerHTML = "";
    updateProjectButtons("None");
}
    
    
    
    
    


