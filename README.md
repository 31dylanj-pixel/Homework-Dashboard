# Homework Dashboard

A clean, personal school assignment dashboard built with HTML, CSS, and JavaScript.

Designed to make it easy to keep track of assignments, due dates, priorities, classes, and completed work — all from one place.

## ✨ Features

### 📚 Assignment Management

* Add assignments with:

  * Assignment name
  * Class
  * Due date
  * Due time
  * Priority
* Edit assignments after creating them
* Mark assignments as completed
* Delete assignments
* View assignment priority directly beside the due date
* Automatically organize assignments by:

  * **Priority**
  * **Due Date**
  * **Manual order**
* Drag assignments into a custom order

### 🎯 Priority System

Assignments can have three priority levels:

* 🔴 **High**
* 🟡 **Normal**
* 🟢 **Low**

When sorted by priority, High-priority assignments appear first.

### 🏫 Class Management

Classes can be managed directly from Settings.

* Add classes
* Edit classes
* Delete classes
* Assign custom colors to classes
* Class colors appear beside assignments

### 🎨 Appearance

The dashboard includes multiple background themes:

* Sunset
* Midnight
* Ocean
* Lavender
* Forest
* Cloud

The selected theme is saved automatically.

### 📊 Dashboard Statistics

The dashboard keeps track of:

* **Due Today**
* **Upcoming**
* **Completed**

These statistics update automatically as assignments are added, completed, or deleted.

### 💾 Data Backup

Your dashboard data can be exported as a JSON file.

You can also import a previously exported backup.

This makes it possible to transfer your assignments and classes between devices.

### 📱 PWA Support

The Classroom Dashboard can be installed as a Progressive Web App.

It includes:

* Installable app experience
* Standalone display
* Custom app icon
* iPad/iPhone support
* Offline caching through a service worker
* Persistent local data

## 🛠️ Built With

* HTML5
* CSS3
* JavaScript
* Local Storage
* Service Workers
* Web App Manifest
* Google Fonts

### Fonts

* **Montserrat** — headings
* **Poppins** — body text and interface elements

## 📁 Project Structure

```text
Classroom-Dashboard/
│
├── index.html
├── style.css
├── script.js
├── manifest.json
├── sw.js
│
├── icons/
│   ├── icon.svg
│   ├── icon-192.png
│   └── icon-512.png
│
└── README.md
```

## 🔐 Privacy

The dashboard is designed to work without an external database.

Assignment and class information is stored locally in the browser using `localStorage`.

The project does not require an account or external database.

## 📦 Local Storage

The dashboard currently uses these storage keys:

```text
dashboardClasses
dashboardAssignments
dashboardGradient
```

This allows your data and appearance settings to remain available after closing the app.

## 🚀 Running the Project

The dashboard can be hosted using any static website host.

For example:

* GitHub Pages
* Netlify
* Vercel
* Any standard web server

No backend is required for the core dashboard.

## 📱 Installing on iPad

1. Open the dashboard in Safari.
2. Tap the **Share** button.
3. Select **Add to Home Screen**.
4. Confirm the installation.

The dashboard will then open as an app-style experience.

## 🔄 Updating the PWA

The project uses a service worker to cache important files for offline use.

When making major changes to the project, update the cache version in `sw.js`:

```js
const CACHE_NAME = "school-dashboard-v5";
```

For example:

```text
v5 → v6 → v7
```

This allows the service worker to recognize the updated application files.

## 🎨 Design

The interface uses a glassmorphism-inspired design with:

* Translucent cards
* Rounded corners
* Soft shadows
* Gradient backgrounds
* Responsive layouts
* Minimal interface elements

The layout is designed to work across desktop, tablet, and mobile screens.

## 📌 Roadmap

Potential future features include:

* 🔔 Assignment notifications
* More notification controls
* Calendar integration
* Recurring assignments
* Search and filtering
* Assignment categories
* More themes
* Better touch-based drag and drop
* Additional PWA functionality

## 📄 License

This project is intended as a personal school dashboard project.

You are free to modify the project for your own use.
