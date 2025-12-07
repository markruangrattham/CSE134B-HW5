let projects_api = [];

async function loadProjects() {
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
        return projects_api;
    } catch (error) {
        console.error(error);
        return [];
    }
}

function getProjectFromUrl() {
    const fragment = window.location.hash.substring(1); 
    if (!fragment) {
        return null;
    }
    
    for (let i = 0; i < projects_api.length; i++) {
        const projectLink = projects_api[i].link 
        if (projectLink === fragment || projects_api[i].id === fragment) {
            return projects_api[i];
        }
    }
    console.log("Project not found");
    return null;
}

function renderProject(project) {
    if (!project) {
        document.getElementById('project-title').textContent = 'Project Not Found';
        return;
    }

    document.title = `${project.title} - Project Details`;
    document.getElementById('project-title').textContent = project.title;
    document.getElementById('project-date').textContent = project.date || '';

    if (project.media) {
        const mediaDiv = document.getElementById('project-media');
        if (project.media.type === 'iframe') {
            mediaDiv.innerHTML = `
                <iframe
                    src="${project.media.src}"
                    title="${project.media.title || project.title}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen>
                </iframe>
            `;
        } else if (project.media.sources && project.media.sources.length > 0) {
            const sources = project.media.sources
                .map(s => `<source srcset="${s.srcset}" type="${s.type}">`)
                .join("");
            mediaDiv.innerHTML = `
                <picture>
                    ${sources}
                    <img src="${project.media.src}" alt="${project.media.alt || project.title}">
                </picture>
            `;
        } else {
            mediaDiv.innerHTML = `
                <img src="${project.media.src}" alt="${project.media.alt || project.title}">
            `;
        }
    }

    const descriptionDiv = document.getElementById('project-description');
    descriptionDiv.innerHTML = `<p>${project.description || ''}</p>`;

    const moreInfoDiv = document.getElementById('project-more-info');
    if (moreInfoDiv && (project.pageDetails || project.moreInfo)) {
        moreInfoDiv.innerHTML = `
            <h2>More Information</h2>
            <div class="rich-text-content">${project.pageDetails || project.moreInfo || ''}</div>
        `;
    }

    document.getElementById('project-status').textContent = project.status || '';
    document.getElementById('project-features').textContent = project.features || '';

    const toolsList = document.getElementById('project-tools');
    toolsList.innerHTML = '';
    if (project.tools && project.tools.length > 0) {
        project.tools.forEach(tool => {
            const li = document.createElement('li');
            li.className = 'tech-badge';
            li.textContent = tool;
            toolsList.appendChild(li);
        });
    }

    if (project.liveLink) {
        const header = document.querySelector('.project-header');
        if (header && !header.querySelector('.project-actions')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'project-actions';
            actionsDiv.innerHTML = `<a href="${project.liveLink}" target="_blank" class="action-button">Live Demo</a>`;
            header.appendChild(actionsDiv);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadProjects();
    const project = getProjectFromUrl();
    renderProject(project);
});

