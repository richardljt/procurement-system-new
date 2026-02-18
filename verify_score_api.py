import requests
import json
import time

BASE_URL = "http://localhost:8082/api"

def login():
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "username": "Zhang Ming",
            "password": "123456"
        })
        if response.status_code == 200:
            data = response.json()
            print(f"Login Response: {data}")
            if data.get("returnCode") == "SUC0000":
                token = data.get("body", {}).get("token")
                print(f"Login successful. Token: {token[:10]}...")
                return token
            else:
                print(f"Login failed: {data}")
        else:
            print(f"Login failed with status {response.status_code}")
    except Exception as e:
        print(f"Login exception: {e}")
    return None

def verify_score_flow():
    token = login()
    if not token:
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get Evaluation Detail
    project_code = "EVAL-2024-001"
    print(f"\nFetching detail for {project_code}...")
    res = requests.get(f"{BASE_URL}/evaluation/{project_code}", headers=headers)
    if res.status_code != 200:
        print(f"Failed to get detail: {res.text}")
        return
        
    data = res.json().get("body")
    if not data:
        print("No data found")
        return
        
    experts = data.get("experts", [])
    print(f"Experts found: {len(experts)}")
    for e in experts:
        print(f"  - {e['id']}: {e['expertName']}")

    suppliers = data.get("suppliers", [])
    if not suppliers:
        print("No suppliers found")
        return
        
    supplier_id = suppliers[0]["id"]
    print(f"Target Supplier ID: {supplier_id}")
    
    # 2. Submit Score
    print(f"\nSubmitting score for supplier {supplier_id}...")
    score_payload = {
        "supplierId": supplier_id,
        "score": 85.5,
        "details": json.dumps({"tech": 40, "qual": 30, "service": 15.5}),
        "comment": "Verified by script"
    }
    
    res = requests.post(f"{BASE_URL}/evaluation/{project_code}/score", json=score_payload, headers=headers)
    print(f"Submit response: {res.text}")
    
    if res.status_code == 200 and res.json().get("returnCode") == "SUC0000":
        print("Score submitted successfully.")
    else:
        print("Score submission failed.")
        return

    # 3. Verify Score Updated
    print(f"\nVerifying score update...")
    res = requests.get(f"{BASE_URL}/evaluation/{project_code}", headers=headers)
    data = res.json().get("body")
    scores = data.get("scores", [])
    
    found = False
    for s in scores:
        if s["supplierId"] == supplier_id and s["score"] == 85.5:
            print(f"Found updated score: {s}")
            found = True
            break
            
    if found:
        print("Verification SUCCESS!")
    else:
        print("Verification FAILED: Score not found or value mismatch.")
        print(f"Current scores: {scores}")

if __name__ == "__main__":
    verify_score_flow()
