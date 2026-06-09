from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import uvicorn
from dotenv import load_dotenv
from bson import ObjectId
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client.notes_app


@app.get("/notes")
async def get_notes():
    notes = list(db.notes.find({"deleted": {"$ne": True}}))

    for note in notes:
        note["_id"] = str(note["_id"])

    return notes


@app.post("/notes")
async def create_note(note: dict):
    note["deleted"] = False

    result = db.notes.insert_one(note)

    return {"id": str(result.inserted_id)}


@app.put("/notes/{note_id}")
async def update_note(note_id: str, updated_note: dict):
    db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": updated_note}
    )

    return {"message": "Note updated"}


@app.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": {"deleted": True}}
    )

    return {"message": "Note deleted"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)