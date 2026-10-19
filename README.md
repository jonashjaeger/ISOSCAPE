# ISOSCAPE v0.2 — archaeological isotope explorer

Static, mobile-friendly isotope research explorer for GitHub Pages. The application includes **synthetic demo data only** (fictional specimens and sites). No unpublished isotope observations are included.

## Deploy to GitHub Pages

Upload the contents of this directory to the root of a public GitHub repository. Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, select `main` and `/(root)` and save. The site is available at `https://YOUR-USERNAME.github.io/REPOSITORY/` after GitHub builds it.

## Usage on iPhone

In Safari, open the published site and use **Import CSV** to choose your real dataset from the iOS Files app. Imported content is processed in the browser only; this static application does not transmit or store it remotely. Refreshing resets to the synthetic demo. GitHub Pages is public: **never commit research data** into the repository.

The page and scripts require a web server (GitHub Pages is fine). For local development use `python3 -m http.server 8000` and open `http://localhost:8000`.

## Project layout

- `index.html`: page markup
- `css/styles.css`: visual design and responsive layout
- `js/demo.js`: bundled fictional demonstration records
- `js/importer.js`: CSV/TSV parsing and normalization
- `js/statistics.js`: descriptive statistics
- `js/plots.js`: SVG plot and interactions
- `js/analysis.js`: summaries, quality-control indicators, husbandry comparison
- `js/app.js`: state, filtering, sample table, import and export actions
- `data/synthetic-demo.csv`: downloadable demonstration dataset

## Data format

Columns: `Sample`, `Site`, `Geography`, `Tissue`, `Chronology`, `Species`, `d13C`, `d15N`, `d34S`, `Notes`, `Reference`; optional `CN`, `CollagenYield`, `CS`, `NS`. Missing isotope values are blank, not zero. Quality-control flags do **not** establish validity when required collagen measurements are missing.

## Compatibility

No frameworks, package manager, backend, telemetry, or remote dependencies. JavaScript is divided into ordered, deferred files to keep the original app behaviour while making individual modules maintainable.
