/* =========================================
   CLASSROOM DASHBOARD
========================================= */


/* =========================================
   DEFAULT DATA
========================================= */

const defaultClasses = [
    {
        id: crypto.randomUUID(),
        name: "ICP 8",
        color: "#667eea"
    },
    {
        id: crypto.randomUUID(),
        name: "Science 8",
        color: "#8e7cc3"
    },
    {
        id: crypto.randomUUID(),
        name: "English 8",
        color: "#5fa58b"
    },
    {
        id: crypto.randomUUID(),
        name: "Math 8",
        color: "#d88b65"
    }
];


const gradients = [
    {
        name: "Sunset",
        value: "linear-gradient(180deg, #989ecb 0%, #8ca4c6 16.667%, #92a9be 33.333%, #a7acb4 50%, #c4afa8 66.667%, #dfaf9d 83.333%, #eeae93 100%)",
        text: "dark"
    },
    {
        name: "Midnight",
        value: "linear-gradient(180deg, #0b1220 0%, #111d32 50%, #172a46 100%)",
        text: "light"
    },
    {
        name: "Ocean",
        value: "linear-gradient(180deg, #164e63 0%, #155e75 50%, #0e7490 100%)",
        text: "light"
    },
    {
        name: "Lavender",
        value: "linear-gradient(180deg, #c4b5fd 0%, #a78bfa 50%, #818cf8 100%)",
        text: "dark"
    },
    {
        name: "Forest",
        value: "linear-gradient(180deg, #163a2c 0%, #1f513c 50%, #285f48 100%)",
        text: "light"
    },
    {
        name: "Cloud",
        value: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)",
        text: "dark"
    }
];


const classColors = [
    "#667eea",
    "#8e7cc3",
    "#5fa58b",
    "#d88b65",
    "#d66d75",
    "#5c9ead",
    "#b58b5c",
    "#8c78a8",
    "#6c9b76",
    "#c27878"
];

function applyTextTheme() {
    const gradient = gradients.find(
        item => item.name === selectedGradient
    );

    if (!gradient) return;

    document.body.classList.toggle(
        "light-text",
        gradient.text === "light"
    );
}

/* =========================================
   STORAGE
========================================= */

let classes =
    JSON.parse(localStorage.getItem("dashboardClasses"))
    || defaultClasses;

let assignments =
    JSON.parse(localStorage.getItem("dashboardAssignments"))
    || [];

let selectedGradient =
    localStorage.getItem("dashboardGradient")
    || "sunset";

let editingClassId = null;
let selectedClassColor = classColors[0];


function saveData() {

    localStorage.setItem(
        "dashboardClasses",
        JSON.stringify(classes)
    );

    localStorage.setItem(
        "dashboardAssignments",
        JSON.stringify(assignments)
    );
}


/* =========================================
   ELEMENTS
========================================= */

const assignmentList =
    document.getElementById("assignmentList");

const emptyState =
    document.getElementById("emptyState");

const assignmentModal =
    document.getElementById("assignmentModal");

const settingsModal =
    document.getElementById("settingsModal");

const classModal =
    document.getElementById("classModal");

const assignmentForm =
    document.getElementById("assignmentForm");

const classForm =
    document.getElementById("classForm");

const assignmentClass =
    document.getElementById("assignmentClass");

const classList =
    document.getElementById("classList");

const gradientGrid =
    document.getElementById("gradientGrid");

const colorPicker =
    document.getElementById("colorPicker");


/* =========================================
   DATE / GREETING
========================================= */

function updateHeader() {

    const now = new Date();

    const hour = now.getHours();

    let greeting = "Good evening";

    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour < 18) {
        greeting = "Good afternoon";
    }

    document.getElementById("greeting").textContent =
        greeting;

    document.getElementById("dateText").textContent =
        now.toLocaleDateString(
            undefined,
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );
}


/* =========================================
   GRADIENTS
========================================= */

function renderGradients() {

    gradientGrid.innerHTML = "";

    gradients.forEach(gradient => {

        const button =
            document.createElement("button");

        button.className = "gradient-option";

        if (gradient.id === selectedGradient) {
            button.classList.add("active");
        }

        button.style.background = gradient.css;

        button.innerHTML =
            `<span>${gradient.name}</span>`;

        button.addEventListener("click", () => {

            selectedGradient = gradient.id;

            localStorage.setItem(
                "dashboardGradient",
                selectedGradient
            );

            applyGradient();

            renderGradients();
        });

        gradientGrid.appendChild(button);
    });
}


function applyGradient() {
    const gradient = gradients.find(
        item => item.name === selectedGradient
    );

    if (!gradient) return;

    document.body.style.background =
        gradient.value;

    applyTextTheme();
}

/* =========================================
   CLASSES
========================================= */

function renderClassOptions() {

    assignmentClass.innerHTML = "";

    classes.forEach(classItem => {

        const option =
            document.createElement("option");

        option.value = classItem.id;
        option.textContent = classItem.name;

        assignmentClass.appendChild(option);
    });

    if (classes.length === 0) {

        const option =
            document.createElement("option");

        option.value = "";
        option.textContent = "No classes available";

        assignmentClass.appendChild(option);
    }
}


function renderClasses() {

    classList.innerHTML = "";

    if (classes.length === 0) {

        classList.innerHTML =
            `<p class="setting-description">
                No classes yet. Add one above.
            </p>`;

        return;
    }

    classes.forEach(classItem => {

        const row =
            document.createElement("div");

        row.className = "class-row";

        row.innerHTML = `
            <span
                class="class-color"
                style="background:${classItem.color}">
            </span>

            <span class="class-name">
                ${escapeHTML(classItem.name)}
            </span>

            <div class="class-actions">

                <button
                    class="class-action edit-class"
                    title="Edit">
                    ✎
                </button>

                <button
                    class="class-action delete-class"
                    title="Delete">
                    ×
                </button>

            </div>
        `;

        row.querySelector(".edit-class")
            .addEventListener(
                "click",
                () => openEditClass(classItem.id)
            );

        row.querySelector(".delete-class")
            .addEventListener(
                "click",
                () => deleteClass(classItem.id)
            );

        classList.appendChild(row);
    });
}


/* =========================================
   CLASS MODAL
========================================= */

function openAddClass() {

    editingClassId = null;

    document.getElementById("classModalTitle")
        .textContent = "Add Class";

    document.getElementById("className")
        .value = "";

    selectedClassColor = classColors[0];

    renderColorPicker();

    classModal.classList.add("active");
}


function openEditClass(id) {

    const classItem =
        classes.find(item => item.id === id);

    if (!classItem) return;

    editingClassId = id;

    document.getElementById("classModalTitle")
        .textContent = "Edit Class";

    document.getElementById("className")
        .value = classItem.name;

    selectedClassColor =
        classItem.color;

    renderColorPicker();

    classModal.classList.add("active");
}


function renderColorPicker() {

    colorPicker.innerHTML = "";

    classColors.forEach(color => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className = "color-option";

        button.style.background = color;

        if (color === selectedClassColor) {
            button.classList.add("selected");
        }

        button.addEventListener(
            "click",
            () => {

                selectedClassColor = color;

                renderColorPicker();
            }
        );

        colorPicker.appendChild(button);
    });
}


classForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const name =
            document.getElementById("className")
                .value.trim();

        if (!name) return;


        if (editingClassId) {

            const classItem =
                classes.find(
                    item => item.id === editingClassId
                );

            if (classItem) {

                classItem.name = name;
                classItem.color = selectedClassColor;
            }

        } else {

            classes.push({
                id: crypto.randomUUID(),
                name,
                color: selectedClassColor
            });

        }

        saveData();

        renderClasses();
        renderClassOptions();
        renderAssignments();

        classModal.classList.remove("active");
    }
);


/* =========================================
   DELETE CLASS
========================================= */

function deleteClass(id) {

    const classItem =
        classes.find(item => item.id === id);

    if (!classItem) return;

    const confirmed =
        confirm(
            `Delete "${classItem.name}"?\n\nExisting assignments will be kept.`
        );

    if (!confirmed) return;

    classes =
        classes.filter(item => item.id !== id);

    saveData();

    renderClasses();
    renderClassOptions();
    renderAssignments();
}


/* =========================================
   ASSIGNMENTS
========================================= */

function renderAssignments() {

    assignmentList.innerHTML = "";

    const sorted =
        [...assignments].sort(
            (a, b) => {

                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }

                return (
                    new Date(a.dueDate + "T" + (a.dueTime || "23:59"))
                    -
                    new Date(b.dueDate + "T" + (b.dueTime || "23:59"))
                );
            }
        );


    if (sorted.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

        sorted.forEach(assignment => {

            const classItem =
                classes.find(
                    item => item.id === assignment.classId
                );

            const color =
                classItem?.color || "#999999";

            const className =
                classItem?.name || "No Class";

            const card =
                document.createElement("article");

            card.className =
                "assignment-card"
                + (assignment.completed
                    ? " completed"
                    : "");

            card.innerHTML = `

                <div
                    class="assignment-color"
                    style="background:${color}">
                </div>

                <div class="assignment-main">

                    <div
                        class="assignment-class"
                        style="color:${color}">
                        ${escapeHTML(className)}
                    </div>

                    <div class="assignment-name">
                        ${escapeHTML(assignment.name)}
                    </div>

                    <div class="assignment-due">
                        Due ${formatDueDate(assignment)}
                    </div>

                </div>

                <div class="assignment-actions">

                    <button
                        class="complete-button"
                        title="Complete">
                        ${assignment.completed ? "↶" : "✓"}
                    </button>

                    <button
                        class="delete-assignment-button"
                        title="Delete">
                        ×
                    </button>

                </div>
            `;


            card.querySelector(".complete-button")
                .addEventListener(
                    "click",
                    () => toggleAssignment(assignment.id)
                );


            card.querySelector(".delete-assignment-button")
                .addEventListener(
                    "click",
                    () => deleteAssignment(assignment.id)
                );


            assignmentList.appendChild(card);
        });
    }

    updateStats();
}


/* =========================================
   ADD ASSIGNMENT
========================================= */

assignmentForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        if (classes.length === 0) {
            alert("Please add a class first.");
            return;
        }

        const name =
            document.getElementById("assignmentName")
                .value.trim();

        const classId =
            document.getElementById("assignmentClass")
                .value;

        const dueDate =
            document.getElementById("assignmentDate")
                .value;

        const dueTime =
            document.getElementById("assignmentTime")
                .value;

        const priority =
            document.getElementById("assignmentPriority")
                .value;


        assignments.push({

            id: crypto.randomUUID(),

            name,

            classId,

            dueDate,

            dueTime,

            priority,

            completed: false,

            createdAt: new Date().toISOString()
        });


        saveData();

        renderAssignments();

        assignmentForm.reset();

        assignmentModal.classList.remove("active");
    }
);


/* =========================================
   COMPLETE / DELETE
========================================= */

function toggleAssignment(id) {

    const assignment =
        assignments.find(
            item => item.id === id
        );

    if (!assignment) return;

    assignment.completed =
        !assignment.completed;

    saveData();

    renderAssignments();
}


function deleteAssignment(id) {

    assignments =
        assignments.filter(
            item => item.id !== id
        );

    saveData();

    renderAssignments();
}


/* =========================================
   DATE FORMATTING
========================================= */

function formatDueDate(assignment) {

    const date =
        new Date(
            `${assignment.dueDate}T${assignment.dueTime || "23:59"}`
        );

    if (Number.isNaN(date.getTime())) {
        return "No due date";
    }

    const now = new Date();

    const today =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

    const tomorrow =
        new Date(today);

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );

    const assignmentDay =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );


    let result;

    if (
        assignmentDay.getTime()
        === today.getTime()
    ) {

        result = "Today";

    } else if (
        assignmentDay.getTime()
        === tomorrow.getTime()
    ) {

        result = "Tomorrow";

    } else {

        result =
            date.toLocaleDateString(
                undefined,
                {
                    month: "short",
                    day: "numeric"
                }
            );
    }


    if (assignment.dueTime) {

        result +=
            " · " +
            date.toLocaleTimeString(
                undefined,
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            );
    }

    return result;
}


/* =========================================
   STATS
========================================= */

function updateStats() {

    const now = new Date();

    const today =
        now.toISOString()
            .split("T")[0];

    const todayCount =
        assignments.filter(
            item =>
                item.dueDate === today
                && !item.completed
        ).length;

    const upcomingCount =
        assignments.filter(
            item =>
                item.dueDate >= today
                && !item.completed
        ).length;

    const completedCount =
        assignments.filter(
            item => item.completed
        ).length;


    document.getElementById("todayCount")
        .textContent = todayCount;

    document.getElementById("upcomingCount")
        .textContent = upcomingCount;

    document.getElementById("completedCount")
        .textContent = completedCount;
}


/* =========================================
   MODAL CONTROLS
========================================= */

document.getElementById("addButton")
    .addEventListener(
        "click",
        () => {

            renderClassOptions();

            if (classes.length === 0) {
                alert("Add a class in Settings first.");
                return;
            }

            assignmentModal.classList.add("active");
        }
    );


document.getElementById("closeAssignmentModal")
    .addEventListener(
        "click",
        () => {
            assignmentModal.classList.remove("active");
        }
    );


document.getElementById("settingsButton")
    .addEventListener(
        "click",
        () => {
            settingsModal.classList.add("active");
        }
    );


document.getElementById("closeSettingsModal")
    .addEventListener(
        "click",
        () => {
            settingsModal.classList.remove("active");
        }
    );


document.getElementById("addClassButton")
    .addEventListener(
        "click",
        openAddClass
    );


document.getElementById("closeClassModal")
    .addEventListener(
        "click",
        () => {
            classModal.classList.remove("active");
        }
    );


/* =========================================
   CLOSE MODALS WHEN CLICKING OUTSIDE
========================================= */

[
    assignmentModal,
    settingsModal,
    classModal
].forEach(modal => {

    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                modal.classList.remove("active");
            }
        }
    );
});


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================
   EXPORT
========================================= */

document.getElementById("exportButton")
    .addEventListener(
        "click",
        () => {

            const data = {
                classes,
                assignments,
                selectedGradient
            };

            const blob =
                new Blob(
                    [JSON.stringify(data, null, 2)],
                    {
                        type: "application/json"
                    }
                );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;
            link.download =
                "classroom-dashboard-backup.json";

            link.click();

            URL.revokeObjectURL(url);
        }
    );


/* =========================================
   IMPORT
========================================= */

document.getElementById("importInput")
    .addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];

            if (!file) return;

            const reader =
                new FileReader();

            reader.onload =
                () => {

                    try {

                        const data =
                            JSON.parse(
                                reader.result
                            );

                        if (Array.isArray(data.classes)) {
                            classes = data.classes;
                        }

                        if (Array.isArray(data.assignments)) {
                            assignments = data.assignments;
                        }

                        if (data.selectedGradient) {
                            selectedGradient =
                                data.selectedGradient;

                            localStorage.setItem(
                                "dashboardGradient",
                                selectedGradient
                            );
                        }

                        saveData();

                        applyGradient();
                        renderGradients();
                        renderClasses();
                        renderClassOptions();
                        renderAssignments();

                        alert("Dashboard data imported!");

                    } catch {

                        alert(
                            "That file doesn't appear to be a valid dashboard backup."
                        );
                    }
                };

            reader.readAsText(file);

            event.target.value = "";
        }
    );


/* =========================================
   INITIALIZE
========================================= */

updateHeader();

applyGradient();

renderGradients();

renderClasses();

renderClassOptions();

renderAssignments();

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js")
            .then(() => {
                console.log("School Dashboard offline mode enabled.");
            })
            .catch(error => {
                console.error("Service worker registration failed:", error);
            });
    });
}
