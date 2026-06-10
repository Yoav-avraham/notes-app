from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import uvicorn
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client.notes_app


@app.get("/notes")
async def get_notes():
    notes = list(db.notes.find())

    for note in notes:
        note["_id"] = str(note["_id"])

    return notes


@app.post("/notes")
async def create_note(note: dict):
    result = db.notes.insert_one(note)

    return {"id": str(result.inserted_id)}


@app.put("/notes/{note_id}")
async def update_note(note_id: str, updated_note: dict):
    result = db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": updated_note}
    )

    if result.matched_count == 0:
        return {"message": "Note not found"}

    return {"message": "Note updated"}


@app.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    result = db.notes.delete_one(
        {"_id": ObjectId(note_id)}
    )

    if result.deleted_count == 0:
        return {"message": "Note not found"}

    return {"message": "Note deleted"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)