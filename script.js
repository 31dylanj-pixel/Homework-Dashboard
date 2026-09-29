/* =========================================
   CLASSROOM DASHBOARD
========================================= */


/* =========================================
   DEFAULT DATA
========================================= */

const defaultClasses = [
    {
        id: crypto.randomUUID(),
        name: "ICP",
        color: "#667eea"
    },
    {
        id: crypto.randomUUID(),
        name: "Algebra 1",
        color: "#8e7cc3"
    },
    {
        id: crypto.randomUUID(),
        name: "LA",
        color: "#5fa58b"
    },
    {
        id: crypto.randomUUID(),
        name: "Social Studies",
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
    || "Sunset";

let notificationsEnabled =
    localStorage.getItem("dashboardNotifications") === "true";

let notificationTimes =
    JSON.parse(
        localStorage.getItem("dashboardNotificationTimes")
    ) || [];

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

    syncAssignmentsToCloud();
}

/* =========================================
   NOTIFICATIONS
========================================= */

const VAPID_PUBLIC_KEY =
    "BHM9DjByzig_JxgDu9kN1mnKtYNenubKDj3rvUOKwvx9APsrqDOvP4e_do_7ZoVrNCKKmz2fzfvusMb4gH6pdrw";

const NOTIFICATION_API =
    "https://classroom-dashboard-notifications.31dylan-j.workers.dev";

async function syncAssignmentsToCloud() {
    try {
        const timezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;

        const cloudAssignments = assignments.map(assignment => {
            let dueAt = null;

            if (assignment.dueDate) {
                const time = assignment.dueTime || "23:59";

                // Convert the dashboard's local date/time
                // into an absolute UTC timestamp.
                dueAt = new Date(
                    `${assignment.dueDate}T${time}:00`
                ).toISOString();
            }

            return {
                ...assignment,
                className:
                    classes.find(c => c.id === assignment.classId)?.name
                    || "No Class",
                dueAt
            };
        });

        const response = await fetch(
            `${NOTIFICATION_API}/assignments`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    assignments: cloudAssignments,
                    notificationsEnabled,
                    notificationTimes,
                    timezone
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                `Cloud sync failed: HTTP ${response.status}`
            );
        }

        const result = await response.json();

        console.log("☁️ Dashboard synced:", result);

    } catch (error) {
        console.error("☁️ Dashboard sync failed:", error);
    }
}

const notificationToggle =
    document.getElementById("notificationToggle");

const notificationOptions =
    document.getElementById("notificationOptions");

const notificationTimeInputs =
    document.querySelectorAll(".notification-time");

function urlBase64ToUint8Array(base64String) {

    const padding =
        "=".repeat(
            (4 - base64String.length % 4) % 4
        );

    const base64 =
        (
            base64String +
            padding
        )
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const rawData =
        atob(base64);

    return Uint8Array.from(
        [...rawData].map(
            char => char.charCodeAt(0)
        )
    );
}

async function registerForPushNotifications() {

    try {

        if (!("serviceWorker" in navigator)) {
            throw new Error("Step 1 failed: Service workers are not supported.");
        }

        if (!("PushManager" in window)) {
            throw new Error("Step 2 failed: PushManager is not supported.");
        }

        const registration =
            await navigator.serviceWorker.ready;

        console.log("STEP 3: Service worker ready");

        let subscription =
            await registration.pushManager.getSubscription();

        console.log(
            "STEP 4: Existing subscription:",
            subscription
        );

        if (!subscription) {

            console.log("STEP 5: Creating push subscription...");

            subscription =
                await registration.pushManager.subscribe({

                    userVisibleOnly: true,

                    applicationServerKey:
                        urlBase64ToUint8Array(
                            VAPID_PUBLIC_KEY
                        )
                });

            console.log(
                "STEP 6: Push subscription created:",
                subscription
            );
        }

        console.log("STEP 7: Sending subscription to Worker...");

        const response =
            await fetch(
                `${NOTIFICATION_API}/subscribe`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            subscription
                        )
                }
            );

        console.log(
            "STEP 8: Worker response:",
            response.status
        );

        if (!response.ok) {
            throw new Error(
                `Step 9 failed: Worker returned HTTP ${response.status}`
            );
        }

        console.log("STEP 10: Registration successful!");

        return subscription;

    } catch (error) {

        alert(
            "Notification setup failed:\n\n" +
            error.name +
            "\n\n" +
            error.message
        );

        throw error;
    }
}

notificationToggle.addEventListener("change", async () => {

        if (notificationToggle.checked) {

            if (!("Notification" in window)) {
                alert(
                    "This device does not support notifications."
                );

                notificationToggle.checked = false;
                return;
            }

            const permission =
                await Notification.requestPermission();

            if (permission !== "granted") {

                notificationToggle.checked = false;

                alert(
                    "Notification permission was not granted."
                );

                return;
            }

            /* Register this device for Web Push */

            try {

                await registerForPushNotifications();

                notificationsEnabled = true;

            } catch (error) {

                console.error(
                    "Push registration failed:",
                    error
                );

                notificationToggle.checked = false;

                alert(
                    "Push registration failed:\n\n" +
                    error.message
                );

                return;
            }

        } else {

            notificationsEnabled = false;
        }

        localStorage.setItem(
          "dashboardNotifications",
          notificationsEnabled
        );
      
        syncAssignmentsToCloud();
      
        renderNotificationSettings();
    }
);

function renderNotificationSettings() {

    notificationToggle.checked =
        notificationsEnabled;

    notificationTimeInputs.forEach(input => {
        input.checked =
            notificationTimes.includes(
                Number(input.value)
            );
    });

    notificationOptions.classList.toggle(
        "disabled",
        !notificationsEnabled
    );
}

notificationTimeInputs.forEach(input => {

    input.addEventListener(
        "change",
        () => {

            notificationTimes =
                [...notificationTimeInputs]
                    .filter(item => item.checked)
                    .map(item => Number(item.value));

            localStorage.setItem(
                "dashboardNotificationTimes",
                JSON.stringify(notificationTimes)
            );

            syncAssignmentsToCloud();
        }
    );

});

renderNotificationSettings();

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

        if (gradient.name === selectedGradient) {
            button.classList.add("active");
        }

        button.style.background = gradient.value;

        button.innerHTML =
            `<span>${gradient.name}</span>`;

        button.addEventListener("click", () => {

            selectedGradient = gradient.name;

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

    const sortMode =
        document.getElementById("assignmentSort")?.value
        || "priority";

    let sorted = [...assignments];

    const priorityOrder = {
        high: 1,
        normal: 2,
        low: 3
    };

    if (sortMode === "priority") {

        sorted.sort((a, b) => {

            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            const priorityA =
                priorityOrder[a.priority || "normal"] || 2;

            const priorityB =
                priorityOrder[b.priority || "normal"] || 2;

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            return (
                new Date(
                    a.dueDate +
                    "T" +
                    (a.dueTime || "23:59")
                )
                -
                new Date(
                    b.dueDate +
                    "T" +
                    (b.dueTime || "23:59")
                )
            );
        });

    } else if (sortMode === "due") {

        sorted.sort((a, b) => {

            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            return (
                new Date(
                    a.dueDate +
                    "T" +
                    (a.dueTime || "23:59")
                )
                -
                new Date(
                    b.dueDate +
                    "T" +
                    (b.dueTime || "23:59")
                )
            );
        });

    } else {

        /*
         * Manual order
         */
        sorted.sort(
            (a, b) =>
                (a.order ?? 0) -
                (b.order ?? 0)
        );
    }

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

            card.draggable = true;

            card.dataset.assignmentId =
                assignment.id;

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
                         <span class="assignment-priority">
                             · Priority: ${escapeHTML(
                                 capitalizePriority(assignment.priority)
                             )}
                         </span>
                    </div>

                </div>

                <div class="assignment-actions">

                   <button
                       class="edit-assignment-button"
                       title="Edit">
                       ✎
                   </button>
               
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

            card.querySelector(".edit-assignment-button")
             .addEventListener(
                 "click",
                 () => editAssignment(assignment.id)
            );

            card.querySelector(".delete-assignment-button")
                .addEventListener(
                    "click",
                    () => deleteAssignment(assignment.id)
                );

            card.addEventListener(
                "dragstart",
                event => {
            
                    event.dataTransfer.setData(
                        "text/plain",
                        assignment.id
                    );
            
                    card.classList.add("dragging");
                }
            );
            
            card.addEventListener(
                "dragend",
                () => {
            
                    card.classList.remove("dragging");
                }
            );
            
            card.addEventListener(
                "dragover",
                event => {
            
                    event.preventDefault();
            
                    const dragging =
                        assignmentList.querySelector(
                            ".dragging"
                        );
            
                    if (!dragging || dragging === card) {
                        return;
                    }
            
                    const rect =
                        card.getBoundingClientRect();
            
                    const halfway =
                        rect.top +
                        rect.height / 2;
            
                    if (event.clientY < halfway) {
            
                        assignmentList.insertBefore(
                            dragging,
                            card
                        );
            
                    } else {
            
                        assignmentList.insertBefore(
                            dragging,
                            card.nextSibling
                        );
                    }
                }
            );
            
            card.addEventListener(
                "drop",
                event => {
            
                    event.preventDefault();
            
                    const orderedIds =
                        [...assignmentList.children]
                            .map(
                                item =>
                                    item.dataset.assignmentId
                            );
            
                    orderedIds.forEach(
                        (id, index) => {
            
                            const assignment =
                                assignments.find(
                                    item => item.id === id
                                );
            
                            if (assignment) {
                                assignment.order = index;
                            }
                        }
                    );
            
                    saveData();
            
                    const sort =
                        document.getElementById(
                            "assignmentSort"
                        );
            
                    if (sort) {
                        sort.value = "manual";
                    }
            
                    renderAssignments();
                }
            );


            assignmentList.appendChild(card);
        });
    }

    updateStats();
}

function capitalizePriority(priority) {

    if (!priority) {
        return "Normal";
    }

    return (
        priority.charAt(0).toUpperCase()
        + priority.slice(1)
    );
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


        /* =====================================
           EDIT EXISTING ASSIGNMENT
        ===================================== */

        if (editingAssignmentId) {

            const assignment =
                assignments.find(
                    item =>
                        item.id === editingAssignmentId
                );

            if (assignment) {

                assignment.name = name;
                assignment.classId = classId;
                assignment.dueDate = dueDate;
                assignment.dueTime = dueTime;
                assignment.priority = priority;
            }

        }


        /* =====================================
           CREATE NEW ASSIGNMENT
        ===================================== */

        else {

            assignments.push({

                id: crypto.randomUUID(),

                name,

                classId,

                dueDate,

                dueTime,

                priority,

                completed: false,

                order:
                    assignments.length > 0
                        ? Math.max(
                            ...assignments.map(
                                item => item.order ?? 0
                            )
                        ) + 1
                        : 0,

                createdAt:
                    new Date().toISOString()
            });
        }


        saveData();

        renderAssignments();

        assignmentForm.reset();

        editingAssignmentId = null;

        const modalTitle =
            document.querySelector(
                "#assignmentModal h2"
            );

        if (modalTitle) {
            modalTitle.textContent =
                "Add Assignment";
        }

        const submitButton =
            document.querySelector(
                "#assignmentForm .primary-button"
            );

        if (submitButton) {
            submitButton.textContent =
                "Add Assignment";
        }

        assignmentModal.classList.remove("active");
    }
);

/* =========================================
   EDIT ASSIGNMENT
========================================= */

let editingAssignmentId = null;


function editAssignment(id) {

    const assignment =
        assignments.find(
            item => item.id === id
        );

    if (!assignment) return;

    editingAssignmentId = id;

    document.getElementById("assignmentName")
        .value = assignment.name;

    document.getElementById("assignmentClass")
        .value = assignment.classId;

    document.getElementById("assignmentDate")
        .value = assignment.dueDate;

    document.getElementById("assignmentTime")
        .value = assignment.dueTime || "";

    document.getElementById("assignmentPriority")
        .value = assignment.priority || "normal";

    const modalTitle =
        document.querySelector(
            "#assignmentModal h2"
        );

    if (modalTitle) {
        modalTitle.textContent =
            "Edit Assignment";
    }

    const submitButton =
        document.querySelector(
            "#assignmentForm .primary-button"
        );

    if (submitButton) {
        submitButton.textContent =
            "Save Changes";
    }

    assignmentModal.classList.add("active");
}

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

            editingAssignmentId = null;

            assignmentForm.reset();

            const modalTitle =
                document.querySelector(
                    "#assignmentModal h2"
                );

            if (modalTitle) {
                modalTitle.textContent =
                    "Add Assignment";
            }

            const submitButton =
                document.querySelector(
                    "#assignmentForm .primary-button"
                );

            if (submitButton) {
                submitButton.textContent =
                    "Add Assignment";
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

document.getElementById("assignmentSort")
    .addEventListener(
        "change",
        () => {
            renderAssignments();
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
