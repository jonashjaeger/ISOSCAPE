# ISOSCAPE — Archaeological Stable Isotope Explorer

Static, browser-based isotope explorer. No backend, build step or external dependencies.

## Privacy and demo data

**All 36 bundled specimens and all six sites are fictional.** Isotope values were independently generated for demonstration purposes. They are not measured observations and must not be cited as archaeological evidence. The public HTML and example CSV contain no samples, sites, references, or measurements from the private research dataset.

Use **Import CSV** to open your own dataset. Imported CSV/TSV data are read locally by your browser; this application has no upload endpoint and does not send the data to GitHub or store it on the server. Your imported data exist in the current browser tab only. Reloading the page resets to the synthetic demo. Be careful using export or screenshots with private data.

On an iPhone, save your private CSV to **Files**, open the hosted app in Safari, tap **Import CSV** and choose the CSV from Files. Do not add the private CSV to the GitHub repository.

## GitHub Pages deployment

1. Create a public repository named `isoscape`.
2. Upload `index.html`, `isoscape_demo.csv`, `.nojekyll`, `README.md` into the repository root.
3. In **Settings → Pages**, select **Deploy from a branch**, `main`, `/ (root)`.
4. Open `https://YOUR-USERNAME.github.io/isoscape/`.

## Limitations

- Missing isotope values are kept missing, not converted to zero.
- Collagen QC cannot be evaluated without QC laboratory measurements.
- Livestock group comparisons are descriptive, not causal or diagnostic.
- The app does not preserve imported datasets after reload.
