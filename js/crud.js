function handleCrudChange(value) {
    if (value === "update") {
        updateItem();
    } else if (value === "delete") {
        deleteItem();
    }
    else if (value === "edit") {
        editItem();
    }
    else{
        const crudSection = document.querySelector('crud-section');
        crudSection.innerHTML = "";
    }
}

let projects_api = [];

async function loadMoreProjects() {
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
    }
    catch (error) {
        console.error(error);
    }
    
}

async function updateItem(event) {
    if (event) {
        event.preventDefault();
        await handleUpdateSubmit();
        return;
    }
    
    await loadMoreProjects();
    const nextId = getNextProjectId();
    const crudSection = document.querySelector('crud-section');
    crudSection.innerHTML = `
        <form class="crud-form" onsubmit="updateItem(event)">
            <fieldset>
                <legend>Create or Update Item</legend>

                <label for="project-id" hidden>ID (auto-generated)</label>
                <input type="text" id="project-id" name="project-id" value="${nextId}" hidden>

                <label for="project-title">Title</label>
                <input type="text" id="project-title" name="project-title" placeholder="Project Title" minlength="3" required>

                <label for="project-start-month">Start Month</label>
                <input type="month" id="project-start-month" name="project-start-month" required>

                <label for="project-end-month">End Month (optional)</label>
                <input type="month" id="project-end-month" name="project-end-month">

                <label for="project-description">Description</label>
                <textarea id="project-description" name="project-description" placeholder="What is this project about?" minlength="10" required></textarea>

                <label for="project-status">Status</label>
                <input type="text" id="project-status" name="project-status" placeholder="Are we currently working on this project?" required>

                <label for="project-features">Features</label>
                <textarea id="project-features" name="project-features" placeholder="What are the key features of this project?" minlength="10" required></textarea>
                

                <label for="project-media-link">Project Image URL</label>
                <input type="text" id="project-media-link" name="project-media-link" placeholder="https://example.com/project-image.webp" pattern="^https?://.+\\.(?:png|jpe?g|webp|gif)$" title="Use a valid https image URL" required>
            

                <label for="project-tools">Tools (comma-separated)</label>
                <input type="text" id="project-tools" name="project-tools" placeholder="Python, Discord.py, MongoDB" pattern="^[^,]+(,\\s*[^,]+)*$" title="Comma-separated list e.g. HTML, CSS, JS" required>

                <label>
                    <input type="checkbox" id="project-has-page" name="project-has-page">
                    Make this a separate page on the site
                </label>

                <label for="project-external-link">Link to project (optional)</label>
                <input type="url" id="project-external-link" name="project-external-link" placeholder="https://github.com/username/project or https://example.com/demo">

                <button type="submit" class="delete-button">Save Project</button>
            </fieldset>
        </form>
    `;
}

async function deleteItem() {
    const crudSection = document.querySelector('crud-section');

    await loadMoreProjects();
    for (let project of projects_api) {
        console.log(project.id);
    }

    let projectsHTML = '';
    for (let i = 0; i < projects_api.length; i++) {
        projectsHTML += `
        <checkbox-item>
            <input type="checkbox" id="project-${projects_api[i].id}" name="project-${projects_api[i].id}" value="${projects_api[i].id} ">
            <label for="project-${projects_api[i].id}">${projects_api[i].title}</label>
        </checkbox-item>
        `;
    }

    crudSection.innerHTML = `
        <form class="crud-form" onsubmit="deleteSelectedProjects(event)">
            <fieldset>
                <legend>Delete Item</legend>
                <checkbox-list>
                    ${projectsHTML}
                </checkbox-list>
                <button type="submit" class="delete-button">Delete Selected</button>
            </fieldset>
        </form>
    `;
}

async function deleteSelectedProjects(event) {
    event.preventDefault();
    const selectedProjects = document.querySelectorAll('checkbox-item input[type="checkbox"]:checked');
    let selectedProjectsIds = [];
    for (let project of selectedProjects) {
        selectedProjectsIds.push(project.value.trim());
    }
    
    if (selectedProjectsIds.length === 0) {
        alert('Please select at least one project to delete.');
        return;
    }
    
    for (let i = projects_api.length - 1; i >= 0; i--) {
        let currentId = projects_api[i].id;
        if (selectedProjectsIds.includes(currentId)) {
            projects_api.splice(i, 1);
        }
    }
    
    console.log(projects_api);
    await crudDeleteItemCall();
}

async function crudDeleteItemCall() {
    if (await crudCall()) {
        await deleteItem();
    } else {
        alert("Failed to Remove projects. Please try again.");
    }
}

function formatMonthYear(monthValue) {
    if (!monthValue) return '';
    const [year, month] = monthValue.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
}

async function handleUpdateSubmit() {
    await loadMoreProjects();
    
    const id = document.getElementById('project-id').value.trim();
    const title = document.getElementById('project-title').value.trim();
    const startMonth = document.getElementById('project-start-month').value.trim();
    const endMonth = document.getElementById('project-end-month').value.trim();
    const description = document.getElementById('project-description').value.trim();
    const status = document.getElementById('project-status').value.trim();
    const features = document.getElementById('project-features').value.trim();
    const mediaLink = document.getElementById('project-media-link').value.trim();
    const toolsStr = document.getElementById('project-tools').value.trim();
    const hasPage = document.getElementById('project-has-page').checked;
    const externalLink = document.getElementById('project-external-link').value.trim();
    
    const tools = toolsStr.split(',').map(tool => tool.trim()).filter(tool => tool.length > 0);
    
    const link = hasPage ? `${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}` : '';
    
    const media = {
        type: "image",
        sources: [],
        src: mediaLink,
        alt: `Image for ${title}`
    };
    
    const formattedStart = formatMonthYear(startMonth);
    const date = endMonth ? `${formattedStart} - ${formatMonthYear(endMonth)}` : `${formattedStart} - Present`;
    
    const project = {
        id: id,
        title: title,
        date: date,
        description: description,
        status: status,
        features: features,
        media: media,
        tools: tools,
        link: link,
        liveLink: externalLink || undefined
    };
    
    let foundIndex = -1;
    for (let i = 0; i < projects_api.length; i++) {
        if (projects_api[i].id === id) {
            foundIndex = i;
            break;
        }
    }
    
    if (foundIndex >= 0) {
        projects_api[foundIndex] = project;
    } else {
        projects_api.push(project);
    }
    

    if (await crudCall()) {
        alert("Project saved successfully!");
        await updateItem(); 
    } else {
        alert("Failed to save project. Please try again.");
    }
}

async function crudCall() {
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
            throw new Error("Failed to update projects in cloud");
        }
        return true;
    } catch (error) {
        return false;
    }
}

function getNextProjectId() {
    if (!projects_api.length) {
        return 'card0';
    }
    let maxIndex = -1;
    for (const project of projects_api) {
        const match = /^card(\d+)$/.exec(project.id);
        if (match) {
            const num = parseInt(match[1], 10);
            if (!Number.isNaN(num) && num > maxIndex) {
                maxIndex = num;
            }
        }
    }
    return `card${maxIndex + 1}`;
}

async function editItem() {
    await loadMoreProjects();
    const crudSection = document.querySelector('crud-section');

    crudSection.innerHTML = `
        <form class="crud-form" id="quick-edit-form">
            <fieldset>
                <legend>Edit Item</legend>
                <label for="edit-project-select">Choose a project to edit</label>
                <select id="edit-project-select" required></select>

                <label for="edit-title">Title</label>
                <input type="text" id="edit-title" required>

                <label for="edit-status">Status</label>
                <input type="text" id="edit-status" required>

                <label for="edit-description">Description</label>
                <textarea id="edit-description" minlength="10" required></textarea>

                <label for="edit-features">Features</label>
                <textarea id="edit-features" minlength="10" required></textarea>

                <label for="edit-tools">Tools (comma-separated)</label>
                <input type="text" id="edit-tools" required>

                <label for="edit-live-link">Link to project (optional)</label>
                <input type="url" id="edit-live-link" placeholder="https://example.com/demo">

                <button type="submit" class="delete-button">Save Changes</button>
                <button type="button" class="delete-button" style="margin-top: 0.5rem;" onclick="goToEditProject()">Open Advanced Editor</button>
            </fieldset>
        </form>
    `;

    initQuickEditForm();
}

function initQuickEditForm() {
    const selectEl = document.getElementById('edit-project-select');
    const formEl = document.getElementById('quick-edit-form');
    if (!selectEl || !formEl) return;

    selectEl.innerHTML = projects_api
        .map(project => `<option value="${project.id}">${project.title}</option>`)
        .join('');

    selectEl.addEventListener('change', () => fillQuickEditForm(selectEl.value));
    formEl.addEventListener('submit', handleQuickEditSubmit);

    if (projects_api.length) {
        selectEl.value = projects_api[0].id;
        fillQuickEditForm(selectEl.value);
    }
}

function fillQuickEditForm(projectId) {
    const project = projects_api.find(p => p.id === projectId);
    if (!project) return;

    document.getElementById('edit-title').value = project.title || '';
    document.getElementById('edit-status').value = project.status || '';
    document.getElementById('edit-description').value = project.description || '';
    document.getElementById('edit-features').value = project.features || '';
    document.getElementById('edit-tools').value = (project.tools || []).join(', ');
    document.getElementById('edit-live-link').value = project.liveLink || '';
}

async function handleQuickEditSubmit(event) {
    event.preventDefault();

    const select = document.getElementById('edit-project-select');
    if (!select || !select.value) return alert('Please select a project.');

    const projectIndex = projects_api.findIndex(p => p.id === select.value);
    if (projectIndex === -1) return alert('Project not found.');

    projects_api[projectIndex] = {
        ...projects_api[projectIndex],
        title: document.getElementById('edit-title').value.trim(),
        status: document.getElementById('edit-status').value.trim(),
        description: document.getElementById('edit-description').value.trim(),
        features: document.getElementById('edit-features').value.trim(),
        tools: document.getElementById('edit-tools').value.split(',').map(tool => tool.trim()).filter(Boolean),
        liveLink: document.getElementById('edit-live-link').value.trim() || undefined
    };

    if (await crudCall()) {
        alert('Project updated successfully!');
        await editItem();
    } else {
        alert('Failed to update project. Please try again.');
    }
}

function goToEditProject() {
    const select = document.getElementById('edit-project-select');
    if (!select || !select.value) return alert('Please select a project to edit.');

    const project = projects_api.find(p => p.id === select.value);
    if (!project) return alert('Selected project could not be found.');

    const fragment = project.link || project.id;
    window.location.href = `project-template.html#${fragment}`;
}
