import sys, traceback
sys.path.insert(0, '.')
from dotenv import load_dotenv
load_dotenv('.env')

from database import get_db
db = get_db()
doc = db["documents"].find_one({"filename": "Master theorem_e.docx"}) or db["documents"].find_one()
if not doc:
    print("No valid document found in database")
    sys.exit(1)

fake_user = {"user_id": str(doc["user_id"]), "role": "admin", "department": "Technical"}

from pydantic import BaseModel, Field
class Req(BaseModel):
    filename: str = Field(...)
    force: bool = True

from routes.summarize import summarize_document

req = Req(filename=doc["filename"], force=True)
try:
    result = summarize_document(req, current_user=fake_user)
    print("SUCCESS")
    print("Summary:", str(result.get("summary", ""))[:100])
    print("Findings:", result.get("findings"))
except Exception as e:
    print("FAILED")
    traceback.print_exc()
