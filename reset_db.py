import os
from backend.app.db.database import engine, SQLModel

# Path to your SQLite database file
DB_FILE = "database.db"  # adjust this path if your DB is in a subfolder like "db/database.db"

def reset_database():
    # Remove the old database file if it exists
    if os.path.exists(DB_FILE):
        print(f"Deleting {DB_FILE}...")
        os.remove(DB_FILE)
    else:
        print(f"{DB_FILE} does not exist, skipping delete.")

    # Recreate tables (this also creates the database file)
    print("Creating tables...")
    SQLModel.metadata.create_all(engine)
    
    print("Database reset complete!")

if __name__ == "__main__":
    reset_database()