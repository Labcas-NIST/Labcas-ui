Paths to exclude from production deployments

- assets/tmp/**: temporary JSON/data and generators used for demos and testing.
- a/gantt2.html
- a/gantt3.html
- a/gantt-new-single.html
- a/gantt-collection-stacked.html
- a/peaco.html

Notes
- These files are useful for development and demos but should not be served in production.
- If your deploy uses rsync or a copy step, exclude the above paths.
- Alternatively, configure the web server to deny direct access to `assets/tmp/`.
