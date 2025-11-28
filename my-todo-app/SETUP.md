# Django Todo App

A beautiful, fully-featured todo application built with Django. Create, edit, delete todos with due dates and completion tracking using SQLite.

## Features

✅ **Create Todos** — Add tasks with title, description, and due dates  
✅ **Mark Complete** — Toggle completion status with a single click  
✅ **Edit Todos** — Update task details at any time  
✅ **Delete Todos** — Remove completed or unwanted tasks  
✅ **Due Dates** — Assign deadlines and track overdue tasks  
✅ **Statistics** — View pending, completed, and total task counts  
✅ **Admin Panel** — Manage todos via Django admin  
✅ **Responsive UI** — Beautiful Bootstrap-based interface  

## Tech Stack

- **Framework:** Django 5.2+
- **Database:** SQLite (local file-based)
- **Frontend:** Bootstrap 5 + vanilla JavaScript
- **Package Manager:** `uv`

## Quick Start

### Prerequisites
- Python 3.12+
- `uv` package manager (installed in this project)

### Setup

1. **Sync dependencies:**
   ```bash
   uv sync
   ```

2. **Run migrations:**
   ```bash
   uv run python manage.py migrate
   ```

3. **Create a superuser (optional, for admin panel):**
   ```bash
   uv run python manage.py createsuperuser
   ```

4. **Start the development server:**
   ```bash
   uv run python manage.py runserver
   ```

5. **Access the app:**
   - Main app: `http://127.0.0.1:8000/`
   - Admin panel: `http://127.0.0.1:8000/admin/`

## Usage

### Creating a Todo
1. Click **"Add New Todo"** button on the main page
2. Enter a title (required), optional description, and due date
3. Click **"Create Todo"**

### Marking Todos Complete
- Click the checkbox next to any todo to toggle completion status
- Completed todos show a strikethrough and appear lower in the list

### Editing a Todo
1. Click the **"Edit"** button on any todo
2. Update the fields as needed
3. Click **"Update Todo"**

### Deleting a Todo
1. Click the **"Delete"** button on any todo
2. Confirm deletion on the next page

## Database

The app uses **SQLite**, which stores data in `db.sqlite3` in the project root. This is perfect for local development.

### View/Manage Data via Admin Panel
1. Navigate to `http://127.0.0.1:8000/admin/`
2. Log in with your superuser credentials
3. Browse, filter, and manage todos directly

## Project Structure

```
my-todo-app/
├── todoproject/          # Django project settings
│   ├── settings.py       # App config, database settings
│   ├── urls.py           # Main URL routing
│   └── ...
├── todos/                # Todo app
│   ├── models.py         # Todo model definition
│   ├── views.py          # CRUD views
│   ├── forms.py          # Todo form
│   ├── admin.py          # Admin configuration
│   ├── urls.py           # App URL routing
│   ├── templates/        # HTML templates
│   └── migrations/       # Database migrations
├── manage.py             # Django CLI
├── db.sqlite3            # Local database
└── pyproject.toml        # Project dependencies
```

## Development Tips

- **Hot Reload:** Django dev server auto-reloads on code changes
- **Debug Mode:** Set `DEBUG = False` in `settings.py` for production
- **Logs:** Check terminal output for detailed error messages
- **Shell:** Run `uv run python manage.py shell` for interactive Python with Django ORM

## API Endpoints

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/` | List all todos |
| GET | `/create/` | Todo create form |
| POST | `/create/` | Create a new todo |
| GET | `/<id>/edit/` | Edit form for specific todo |
| POST | `/<id>/edit/` | Update a todo |
| GET | `/<id>/delete/` | Delete confirmation page |
| POST | `/<id>/delete/` | Delete a todo |
| GET | `/<id>/toggle/` | Toggle completion status |

## Next Steps

- Add filters (by status, due date)
- Implement categories/tags
- Add recurring todos
- Export/import todos (CSV, JSON)
- Dark mode toggle
- Mobile app variant

## License

This project is part of the AI Engineering Tools repository and is provided for learning and experimentation.

---

**Happy tasking!** 📝✨
