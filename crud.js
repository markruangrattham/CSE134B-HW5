function handleCrudChange(value) {
    if (value === "update") {
        updateItem();
    } else if (value === "delete") {
        deleteItem();
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

                <label for="project-link">Link</label>
                <input type="text" id="project-link" name="project-link" placeholder="valhalla-bot.html" pattern="^(https?://.+|[a-zA-Z0-9-]+\\.html)$" title="Full URL or local .html file" required>

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
    const link = document.getElementById('project-link').value.trim();
    
    const tools = toolsStr.split(',').map(tool => tool.trim()).filter(tool => tool.length > 0);
    
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
        link: link
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
    
    // Save to API
    if (await crudCall()) {
        alert("Project saved successfully!");
        await updateItem(); // Reload form
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
