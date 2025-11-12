#!/usr/bin/env python3
"""
Simple Python HTTP Server for Angular Application
Compatible with Python 3.x
Serves static files and handles Angular routing
"""

import http.server
import socketserver
import os
from urllib.parse import urlparse, unquote

PORT = 9050
DIRECTORY = os.path.join(os.path.dirname(__file__), 'dist', 'medical-tourism', 'browser')

class AngularHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler for Angular routing"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers if needed
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        # Parse the URL
        parsed_path = urlparse(self.path)
        path = unquote(parsed_path.path)
        
        # Remove leading slash
        if path.startswith('/'):
            path = path[1:]
        
        # Full path to the requested file
        full_path = os.path.join(DIRECTORY, path)
        
        # Check if it's a file and exists
        if os.path.isfile(full_path):
            # Serve the actual file
            return super().do_GET()
        
        # Check if it's a directory and has index.html
        if os.path.isdir(full_path):
            index_path = os.path.join(full_path, 'index.html')
            if os.path.isfile(index_path):
                return super().do_GET()
        
        # For Angular routing - serve index.html for all other routes
        # Skip API routes if any
        if not path.startswith('api/'):
            self.path = '/index.html'
            return super().do_GET()
        
        # Default behavior
        return super().do_GET()

def main():
    """Start the server"""
    # Check if dist directory exists
    if not os.path.exists(DIRECTORY):
        print(f"Error: Build directory not found: {DIRECTORY}")
        print("Please run 'ng build' or 'npm run build' first")
        return
    
    # Create server
    with socketserver.TCPServer(("", PORT), AngularHTTPRequestHandler) as httpd:
        print(f"Medical Tourism server running on http://localhost:{PORT}")
        print(f"Serving files from: {DIRECTORY}")
        print(f"Test these URLs:")
        print(f"   - http://localhost:{PORT}")
        print(f"   - http://localhost:{PORT}/doctors")
        print(f"   - http://localhost:{PORT}/treatments/surgical-treatment")
        print(f"   - http://localhost:{PORT}/about")
        print(f"   - http://localhost:{PORT}/contact")
        print("\nPress Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    main()
