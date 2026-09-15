# Website animation exports

The profile artwork is captured from the website's Our technology cards:
- `instinctflash.gif`: converging inference paths, 3.6-second loop.
- `instinctcompress.gif`: compressing model layers, 5-second loop. Used for InstinctRazor, the framework behind InstinctCompress.

Both exports are 640 × 310 at 20 fps. They preserve the website's colors, labels, geometry, and animation timing. Project names and destination links in the profile are maintained separately.

To refresh after a website animation change, install Playwright with Chromium and ffmpeg, start the website locally, then run from this repository:

```sh
node scripts/export-website-animations.cjs http://localhost:5173
```

Alternatively pass the public website URL after the website changes have been deployed. If Playwright is installed outside this repository, set `PLAYWRIGHT_MODULE` to its module path. Review the GIFs and commit them with any README changes. This export is manual; website deployments do not automatically update these files.
