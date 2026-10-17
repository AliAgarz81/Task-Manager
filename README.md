# Task Manager

Node.js + Express + EJS + MySQL 8.4 task manager.

## Requirements
- Node.js 20 or newer
- MySQL 8.4 (running locally)

## 1. Install dependencies
```bash
npm install
```

## 2. Create the database and a dedicated user
Log in as an administrator:
```bash
mysql -u root -p
```
Then run (change the password):
```sql
CREATE DATABASE task_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'taskapp'@'localhost' IDENTIFIED BY 'change_me_strong_password';
GRANT CREATE, SELECT, INSERT, UPDATE, DELETE ON task_manager.* TO 'taskapp'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
The app user can create tables inside `task_manager` only (needed so the app can apply `database/init.sql` automatically) and has no admin rights.

## 3. Schema
Nothing to do: on startup the app runs `database/init.sql` automatically (`CREATE TABLE IF NOT EXISTS`, existing data is never touched).

## 4. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set `DB_PASSWORD` to the password from step 2.

## 5. Start
```bash
npm start
```
Open http://localhost:3000. On startup the app checks the DB connection and exits with an error message if it fails.

## Testing each feature (manual)
| Feature | How to test |
|---|---|
| Dashboard stats | Open `/`; counters match the number of tasks |
| Create | "+ New task", submit; task appears in list, success message shown |
| Validation | Submit empty title or 101+ character title; error shown, nothing saved |
| Details | Click a task title; ID, status and creation date are shown |
| Edit | "Edit", change fields, save; changes visible on the details page |
| Toggle | "Mark completed"/"Mark pending"; badge and stats change |
| Delete | "Delete", confirm dialog appears; Cancel keeps it, OK removes it |
| Filter | Choose a status and "Apply" |
| Search | Type part of a title and "Apply" |
| Persistence | Stop the app (Ctrl+C), start again; tasks are still there |

### API tests
```bash
curl http://localhost:3000/api/tasks
curl "http://localhost:3000/api/tasks?status=pending&search=milk"
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","description":"2 liters"}'
curl http://localhost:3000/api/tasks/1
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","status":"completed"}'
curl -i -X DELETE http://localhost:3000/api/tasks/1      # 204
curl -i http://localhost:3000/api/tasks/999              # 404
curl -i -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" -d '{"title":""}'  # 400
```

## Security notes
- Parameterized queries everywhere (`mysql2` `execute` with `?`)
- Input validation on server side; EJS escapes all output
- `helmet` security headers, request body size limits
- Dedicated DB user with minimal privileges; `.env` is git-ignored
- Not included (by design): authentication and CSRF protection
