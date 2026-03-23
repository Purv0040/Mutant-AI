from fastapi.testclient import TestClient
from main import app
from database import client

# create a mock get_current_user to bypass auth
from auth.dependencies import get_current_user

def override_get_current_user():
    return {"user_id": "60d5ecb74d6bb892182280d4", "role": "user", "department": "it"}

app.dependency_overrides[get_current_user] = override_get_current_user

try:
    with TestClient(app) as test_client:
        response = test_client.post('/summarize', json={'filename': 'W5HH Principle Example_Online Learning Management System.docx', 'force': True})
        print('STATUS:', response.status_code)
        print('RESPONSE:', response.text)
except Exception as e:
    print('EXCEPTION:', e)
finally:
    if client:
        client.close()
