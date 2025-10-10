"""
Simple test to verify chatbot can communicate with MCP server
"""
import requests
import json

def test_chatbot_api():
    """Test the chatbot API endpoint"""
    print("=" * 60)
    print("🧪 Testing Chatbot API with MCP Integration")
    print("=" * 60)
    
    base_url = "http://localhost:8001"
    
    # Test 1: Health check
    print("\n1️⃣ Testing Health Endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ FastAPI service is running")
            print(f"   📊 Response: {response.json()}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Cannot connect to FastAPI service: {e}")
        print("   💡 Make sure the service is running: cd backend/fastapi_service && python -m uvicorn main:app --host 0.0.0.0 --port 8001")
        return
    
    # Test 2: Send a query to chatbot
    print("\n2️⃣ Testing Chatbot Query Processing...")
    try:
        query = "What is the average temperature in the Indian Ocean?"
        payload = {
            "message": query,
            "session_id": "test_session_001"
        }
        
        print(f"   📤 Sending query: '{query}'")
        response = requests.post(
            f"{base_url}/api/chat",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("   ✅ Chatbot responded successfully!")
            print(f"\n   🤖 Response:")
            print(f"   {result.get('response', 'No response')[:300]}...")
            print(f"\n   📊 Metadata:")
            print(f"   - Sources: {len(result.get('sources', []))}")
            print(f"   - Confidence: {result.get('confidence', 0)}")
            print(f"   - Data Source: {result.get('metadata', {}).get('data_source', 'unknown')}")
        else:
            print(f"   ❌ Query failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error during query: {e}")
    
    # Test 3: Test another query for statistics
    print("\n3️⃣ Testing Statistics Query (MCP Tool)...")
    try:
        query = "Calculate temperature statistics for Indian Ocean"
        payload = {
            "message": query,
            "session_id": "test_session_002"
        }
        
        print(f"   📤 Sending query: '{query}'")
        response = requests.post(
            f"{base_url}/api/chat",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("   ✅ Statistics query processed!")
            print(f"\n   🤖 Response preview:")
            print(f"   {result.get('response', 'No response')[:200]}...")
        else:
            print(f"   ❌ Query failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error during query: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Chatbot API Test Complete!")
    print("=" * 60)
    print("\n📝 Conclusions:")
    print("   • If queries succeeded, MCP is integrated with chatbot")
    print("   • Check response metadata for 'data_source': 'neon_cloud_db'")
    print("   • MCP tools provide statistical analysis")

if __name__ == "__main__":
    test_chatbot_api()
