let projects_api = [];
let currentProject = null;

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

function formatMonthYear(monthValue) {
    if (!monthValue) return '';
    const [year, month] = monthValue.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
}

function renderProject(project) {
    if (!project) {
        document.getElementById('project-title').textContent = 'Project Not Found';
        return;
    }

    currentProject = project;

    document.title = `${project.title} - Project Details`;
    document.getElementById('project-title').textContent = project.title;
    document.getElementById('project-date').textContent = project.date || '';

    if (project.media) {
        const mediaDiv = document.getElementById('project-media');
        // Handle both old format (with sources) and new format (just src URL)
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
    descriptionDiv.innerHTML = `<p contenteditable="true" id="editable-description">${project.description || ''}</p>`;

    const moreInfoDiv = document.getElementById('editable-more-info');
    if (moreInfoDiv) {
        moreInfoDiv.innerHTML = project.pageDetails || project.moreInfo || '';
    }

    document.getElementById('project-status').textContent = project.status || '';
    document.getElementById('project-features').innerHTML = `<p contenteditable="true" id="editable-features">${project.features || ''}</p>`;

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
        const actionsDiv = document.querySelector('.project-actions');
        if (actionsDiv) {
            actionsDiv.innerHTML = `<a href="${project.liveLink}" target="_blank" class="action-button">Live Demo</a>`;
        }
    }
}

function formatText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('editable-more-info').focus();
}

async function saveProject() {
    if (!currentProject) return;

    const editableDescription = document.getElementById('editable-description');
    const editableFeatures = document.getElementById('editable-features');
    const editableMoreInfo = document.getElementById('editable-more-info');

    if (editableDescription) {
        currentProject.description = editableDescription.textContent.trim();
    }
    if (editableFeatures) {
        currentProject.features = editableFeatures.textContent.trim();
    }
    if (editableMoreInfo) {
        currentProject.pageDetails = editableMoreInfo.innerHTML.trim();
    }

    let foundIndex = -1;
    for (let i = 0; i < projects_api.length; i++) {
        if (projects_api[i].id === currentProject.id) {
            foundIndex = i;
            break;
        }
    }

    if (foundIndex >= 0) {
        projects_api[foundIndex] = currentProject;
    }

    try {
        const res = await fetch(
            "https://api.jsonbin.io/v3/b/692e3dbbae596e708f7d6edd",
            {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Key":
                        "$2a$10$G/Y9SCnczEMbHyCcAEFTPuFqsLRNVXZaol2M4YtrYs8RckRTMg7YG",
                },
                body: JSON.stringify(projects_api)
            }
        );

        if (!res.ok) {
            throw new Error("Failed to update project in cloud");
        }

        alert("Project saved successfully!");
    } catch (error) {
        console.error("Error saving project:", error);
        alert("Failed to save project. Please try again.");
    }
}

function populateProjectDropdown() {
    const select = document.getElementById('project-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Choose a project...</option>';
    
    for (let i = 0; i < projects_api.length; i++) {
        const option = document.createElement('option');
        option.value = projects_api[i].id;
        option.textContent = projects_api[i].title;
        select.appendChild(option);
    }
}

function loadSelectedProject() {
    const select = document.getElementById('project-select');
    const selectedId = select.value;
    
    if (!selectedId) {
        return;
    }
    
    for (let i = 0; i < projects_api.length; i++) {
        if (projects_api[i].id === selectedId) {
            renderProject(projects_api[i]);
            break;
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadProjects();
    populateProjectDropdown();
    
    const project = getProjectFromUrl();
    if (project) {
        renderProject(project);
        const select = document.getElementById('project-select');
        if (select) {
            select.value = project.id;
        }
    }

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Changes';
    saveButton.className = 'action-button';
    saveButton.style.marginTop = '2rem';
    saveButton.onclick = saveProject;
    
    const actionsDiv = document.querySelector('.project-actions');
    if (actionsDiv) {
        actionsDiv.appendChild(saveButton);
    } else {
        const header = document.querySelector('.project-header');
        if (header) {
            const newActionsDiv = document.createElement('div');
            newActionsDiv.className = 'project-actions';
            newActionsDiv.appendChild(saveButton);
            header.appendChild(newActionsDiv);
        }
    }
});

