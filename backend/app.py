from fastapi import FastAPI
from pymongo import MongoClient
import uvicorn
from dotenv import load_dotenv
import os

app = FastAPI()

# Load environment variables from .env file
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# connect to MongoDB
client = MongoClient(MONGO_URI)
db = client.notes_app


@app.get("/notes")
async def get_notes():
    # get all notes from the db
    notes = list(db.notes.find())
    
    # iterate over the notes and convert the ObjectId to string
    for note in notes:
        note["_id"] = str(note["_id"])
          
    return notes


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)