# New Surya Core source

- `pages/` contains Login plus exactly five dashboard entry files.
- `modules/` contains workflows displayed as tabs inside those dashboards. These are not routes or extra dashboards.
- `components/`, `stores/`, `lib/`, `bakery/`, and `branch/` contain shared business logic and reusable UI required by the five dashboards.

Do not add new operational routes. Add new functionality as a tab/module inside one of the five dashboard files.
