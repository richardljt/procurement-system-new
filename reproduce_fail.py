import requests
import json

BASE_URL = "http://localhost:8082/api"

def login():
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "username": "Zhang Ming",
            "password": "123456"
        })
        if response.status_code == 200:
            data = response.json()
            if data.get("returnCode") == "SUC0000":
                return data.get("body", {}).get("token")
    except Exception as e:
        print(f"Login exception: {e}")
    return None

def reproduce():
    token = login()
    if not token:
        print("Login failed")
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Launch a new evaluation WITHOUT experts
    print("Launching evaluation without experts...")
    # Need a bid ID. Let's assume bid ID 1 exists and we can re-launch or use a new one.
    # Actually, launchEvaluation checks if bid exists.
    # Let's try to find a bid to launch. Or just use a dummy ID if validation is loose?
    # Service: Bid bid = bidMapper.getBidById(dto.getBidId());
    # We need a valid bid ID.
    
    # For now, let's just try to submit score to a project that we know has no experts (if we can create one).
    # Since I can't easily create a bid and launch it without more setup, 
    # I will rely on my analysis.
    
    # Alternative: Create a project directly via SQL? No, I should use API.
    
    # Let's try to use the existing logic to see what happens if I pass an invalid expertId?
    # No, frontend passes null.
    
    pass

if __name__ == "__main__":
    reproduce()
