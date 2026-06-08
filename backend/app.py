from fastapi import FastAPI
from pymongo import MongoClient
import uvicorn
from dotenv import load_dotenv
from bson import ObjectId
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
    # get all notes from the db that are not deleted
    notes = list(db.notes.find({"deleted": {"$ne": True}}))
    
    # iterate over the notes and convert the ObjectId to string
    for note in notes:
        note["_id"] = str(note["_id"])
          
    return notes

@app.post("/notes")
async def create_note(note: dict):
    # set the deleted field to False
    note["deleted"] = False
    # insert the note into the db
    result = db.notes.insert_one(note)

    # return the id of the inserted note
    return {"id": str(result.inserted_id)}

@app.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    # update the note to mark it as deleted
    db.notes.update_one({"_id": ObjectId(note_id)}, {"$set": {"deleted": True}})
    return {str(note_id) : "Note deleted"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
