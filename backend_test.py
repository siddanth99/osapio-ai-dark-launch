#!/usr/bin/env python3
"""
Backend API Testing Suite for Firebase Authentication Integration
Tests Firebase Admin SDK initialization, public endpoints, and protected endpoints
"""

import requests
import json
import os
import sys
from pathlib import Path
import time

# Add backend directory to path for imports
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Test configuration
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://repo-preview-16.preview.emergentagent.com')
API_BASE_URL = f"{BACKEND_URL}/api"

class FirebaseAuthTester:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details
        })
        
    def test_firebase_initialization(self):
        """Test Firebase Admin SDK initialization by importing modules"""
        try:
            # Test if Firebase modules can be imported without errors
            import firebase_config
            import auth_middleware
            
            # Test Firebase app initialization
            app = firebase_config.initialize_firebase()
            if app:
                self.log_test(
                    "Firebase Initialization", 
                    True, 
                    "Firebase Admin SDK initialized successfully"
                )
                return True
            else:
                self.log_test(
                    "Firebase Initialization", 
                    False, 
                    "Firebase app initialization returned None"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Firebase Initialization", 
                False, 
                f"Firebase initialization failed: {str(e)}"
            )
            return False
    
    def test_firestore_client(self):
        """Test Firestore client initialization"""
        try:
            import firebase_config
            client = firebase_config.get_firestore_client()
            if client:
                self.log_test(
                    "Firestore Client", 
                    True, 
                    "Firestore client initialized successfully"
                )
                return True
            else:
                self.log_test(
                    "Firestore Client", 
                    False, 
                    "Firestore client initialization failed"
                )
                return False
        except Exception as e:
            self.log_test(
                "Firestore Client", 
                False, 
                f"Firestore client error: {str(e)}"
            )
            return False
    
    def test_public_root_endpoint(self):
        """Test public root endpoint /api/"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "osapio API" in data["message"]:
                    self.log_test(
                        "Public Root Endpoint", 
                        True, 
                        f"Root endpoint working correctly: {data['message']}"
                    )
                    return True
                else:
                    self.log_test(
                        "Public Root Endpoint", 
                        False, 
                        f"Unexpected response format: {data}"
                    )
                    return False
            else:
                self.log_test(
                    "Public Root Endpoint", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Public Root Endpoint", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_public_health_endpoint(self):
        """Test public health endpoint /api/health"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_test(
                        "Public Health Endpoint", 
                        True, 
                        f"Health endpoint working correctly: {data['status']}"
                    )
                    return True
                else:
                    self.log_test(
                        "Public Health Endpoint", 
                        False, 
                        f"Unexpected health status: {data}"
                    )
                    return False
            else:
                self.log_test(
                    "Public Health Endpoint", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Public Health Endpoint", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_protected_me_endpoint_no_auth(self):
        """Test protected /api/me endpoint without authentication"""
        try:
            response = requests.get(f"{self.base_url}/me", timeout=10)
            
            if response.status_code == 401:
                self.log_test(
                    "Protected /me Endpoint (No Auth)", 
                    True, 
                    "Correctly rejected request without authentication token"
                )
                return True
            elif response.status_code == 403:
                self.log_test(
                    "Protected /me Endpoint (No Auth)", 
                    True, 
                    "Correctly rejected request with 403 Forbidden"
                )
                return True
            else:
                self.log_test(
                    "Protected /me Endpoint (No Auth)", 
                    False, 
                    f"Expected 401/403 but got HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Protected /me Endpoint (No Auth)", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_protected_me_endpoint_invalid_token(self):
        """Test protected /api/me endpoint with invalid token"""
        try:
            headers = {"Authorization": "Bearer invalid_token_12345"}
            response = requests.get(f"{self.base_url}/me", headers=headers, timeout=10)
            
            if response.status_code == 401:
                data = response.json()
                if "detail" in data and "Authentication failed" in data["detail"]:
                    self.log_test(
                        "Protected /me Endpoint (Invalid Token)", 
                        True, 
                        "Correctly rejected invalid token with proper error message"
                    )
                    return True
                else:
                    self.log_test(
                        "Protected /me Endpoint (Invalid Token)", 
                        True, 
                        f"Correctly rejected invalid token: {data}"
                    )
                    return True
            else:
                self.log_test(
                    "Protected /me Endpoint (Invalid Token)", 
                    False, 
                    f"Expected 401 but got HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Protected /me Endpoint (Invalid Token)", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_protected_upload_record_endpoint_no_auth(self):
        """Test protected /api/upload-record endpoint without authentication"""
        try:
            payload = {"filename": "test.txt", "file_size": 1024}
            response = requests.post(f"{self.base_url}/upload-record", json=payload, timeout=10)
            
            if response.status_code == 401:
                self.log_test(
                    "Protected /upload-record Endpoint (No Auth)", 
                    True, 
                    "Correctly rejected POST request without authentication token"
                )
                return True
            elif response.status_code == 403:
                self.log_test(
                    "Protected /upload-record Endpoint (No Auth)", 
                    True, 
                    "Correctly rejected POST request with 403 Forbidden"
                )
                return True
            else:
                self.log_test(
                    "Protected /upload-record Endpoint (No Auth)", 
                    False, 
                    f"Expected 401/403 but got HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Protected /upload-record Endpoint (No Auth)", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_protected_my_uploads_endpoint_no_auth(self):
        """Test protected /api/my-uploads endpoint without authentication"""
        try:
            response = requests.get(f"{self.base_url}/my-uploads", timeout=10)
            
            if response.status_code == 401:
                self.log_test(
                    "Protected /my-uploads Endpoint (No Auth)", 
                    True, 
                    "Correctly rejected request without authentication token"
                )
                return True
            elif response.status_code == 403:
                self.log_test(
                    "Protected /my-uploads Endpoint (No Auth)", 
                    True, 
                    "Correctly rejected request with 403 Forbidden"
                )
                return True
            else:
                self.log_test(
                    "Protected /my-uploads Endpoint (No Auth)", 
                    False, 
                    f"Expected 401/403 but got HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Protected /my-uploads Endpoint (No Auth)", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_legacy_status_endpoints(self):
        """Test legacy status endpoints (should work without auth)"""
        try:
            # Test GET /api/status
            response = requests.get(f"{self.base_url}/status", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test(
                        "Legacy Status GET Endpoint", 
                        True, 
                        f"Status endpoint working, returned {len(data)} records"
                    )
                    get_success = True
                else:
                    self.log_test(
                        "Legacy Status GET Endpoint", 
                        False, 
                        f"Expected list but got: {type(data)}"
                    )
                    get_success = False
            else:
                self.log_test(
                    "Legacy Status GET Endpoint", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                get_success = False
            
            # Test POST /api/status
            payload = {"client_name": "test_client_firebase_auth"}
            response = requests.post(f"{self.base_url}/status", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "client_name" in data and data["client_name"] == "test_client_firebase_auth":
                    self.log_test(
                        "Legacy Status POST Endpoint", 
                        True, 
                        "Status creation endpoint working correctly"
                    )
                    post_success = True
                else:
                    self.log_test(
                        "Legacy Status POST Endpoint", 
                        False, 
                        f"Unexpected response format: {data}"
                    )
                    post_success = False
            else:
                self.log_test(
                    "Legacy Status POST Endpoint", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                post_success = False
            
            return get_success and post_success
                
        except Exception as e:
            self.log_test(
                "Legacy Status Endpoints", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_cors_configuration(self):
        """Test CORS configuration"""
        try:
            # Make an OPTIONS request to check CORS headers
            response = requests.options(f"{self.base_url}/", timeout=10)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            }
            
            if any(cors_headers.values()):
                self.log_test(
                    "CORS Configuration", 
                    True, 
                    f"CORS headers present: {cors_headers}"
                )
                return True
            else:
                # Try a regular GET request and check for CORS headers
                response = requests.get(f"{self.base_url}/", timeout=10)
                if 'Access-Control-Allow-Origin' in response.headers:
                    self.log_test(
                        "CORS Configuration", 
                        True, 
                        f"CORS enabled: {response.headers.get('Access-Control-Allow-Origin')}"
                    )
                    return True
                else:
                    self.log_test(
                        "CORS Configuration", 
                        False, 
                        "No CORS headers found in response"
                    )
                    return False
                
        except Exception as e:
            self.log_test(
                "CORS Configuration", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def run_all_tests(self):
        """Run all Firebase authentication tests"""
        print("=" * 80)
        print("🔥 FIREBASE AUTHENTICATION INTEGRATION TESTS")
        print("=" * 80)
        print(f"Testing backend at: {self.base_url}")
        print()
        
        # Test Firebase initialization
        print("📋 Testing Firebase Admin SDK Initialization...")
        firebase_init_success = self.test_firebase_initialization()
        firestore_success = self.test_firestore_client()
        
        print("\n📋 Testing Public Endpoints (No Auth Required)...")
        root_success = self.test_public_root_endpoint()
        health_success = self.test_public_health_endpoint()
        legacy_success = self.test_legacy_status_endpoints()
        
        print("\n📋 Testing Protected Endpoints (Auth Required)...")
        me_no_auth_success = self.test_protected_me_endpoint_no_auth()
        me_invalid_token_success = self.test_protected_me_endpoint_invalid_token()
        upload_no_auth_success = self.test_protected_upload_record_endpoint_no_auth()
        uploads_no_auth_success = self.test_protected_my_uploads_endpoint_no_auth()
        
        print("\n📋 Testing CORS Configuration...")
        cors_success = self.test_cors_configuration()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n🔍 FIREBASE AUTHENTICATION ANALYSIS:")
        
        # Critical issues analysis
        critical_issues = []
        
        if not firebase_init_success:
            critical_issues.append("Firebase Admin SDK initialization failed")
        
        if not (root_success and health_success):
            critical_issues.append("Public endpoints not working properly")
        
        if not (me_no_auth_success and upload_no_auth_success):
            critical_issues.append("Protected endpoints not properly rejecting unauthorized requests")
        
        if critical_issues:
            print("❌ CRITICAL ISSUES FOUND:")
            for issue in critical_issues:
                print(f"  - {issue}")
        else:
            print("✅ Firebase authentication integration appears to be working correctly!")
            print("  - Firebase Admin SDK initialized successfully")
            print("  - Public endpoints accessible without authentication")
            print("  - Protected endpoints properly reject unauthorized requests")
            print("  - Authentication middleware is functioning as expected")
        
        return failed_tests == 0

if __name__ == "__main__":
    print("Starting Firebase Authentication Integration Tests...")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base URL: {API_BASE_URL}")
    print()
    
    tester = FirebaseAuthTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Firebase authentication integration is working correctly.")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Please check the issues above.")
        sys.exit(1)