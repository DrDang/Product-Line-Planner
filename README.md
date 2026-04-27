# Product-Line Roadmap Decision Tool

Local-first static browser app for product-line variation points, gaps, roadmap candidates, impacts, evidence, assumptions, and export planning.

## Run

Open `index.html` in a browser, or use one of the launchers:

- macOS: `Launch Product Line Roadmap.command`
- Windows: `Launch Product Line Roadmap.bat`

No server, database, package install, telemetry, or internet connection is required.

## Workflow

1. Open a `.plroadmap.json` snapshot, start from the sample project, or create a blank project.
2. Review products, variation points, gaps, roadmap candidates, impacts, evidence, and assumptions.
3. Edit records through the right-side detail drawer.
4. Use **Save Snapshot** to export a new `.plroadmap.json` file, then use **Open** later to import that same snapshot.

The browser cannot overwrite the source project file directly, so exported snapshots are downloaded and should be archived or manually promoted as the new master file.
