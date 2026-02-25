# Root Directory Setup

This is a monorepo structure with frontend and backend as separate applications.

To run the entire project:

1. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Setup backend Python environment (Poetry recommended):**
   Install Poetry (if not installed):
   ```bash
   curl -sSL https://install.python-poetry.org | python3 -
   # or follow instructions at https://python-poetry.org/docs/
   ```

   Then in the backend folder install dependencies and create the virtualenv:
   ```bash
   cd backend
   poetry install
   # To spawn a shell inside the poetry venv:
   poetry shell
   # or run commands via poetry run
   poetry run python app.py
   ```

3. **Run in development mode (in two terminals):**
   
   Terminal 1 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```
   
   Terminal 2 (Backend):
   ```bash
   cd backend
   # Activate venv if not already activated
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py
   ```

4. **Build for production:**
   
   Frontend:
   ```bash
   cd frontend
   npm run build
   ```
   
   Backend is ready as-is:
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py
   ```

For more details, see the README.md in the root directory.
