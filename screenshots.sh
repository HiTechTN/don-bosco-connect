#!/bin/bash
# Script to take screenshots when server is running

# Check if server is running
if ! curl -s http://localhost:8081 > /dev/null; then
    echo "Starting demo server..."
    cd /home/hitech/projects/Don_Bosco_Connect/demo
    python3 -m http.server 8081 &
    sleep 2
fi

echo "Demo server running at http://localhost:8081"
echo "Web demo running at http://localhost:5173"
echo ""
echo "To take screenshots manually:"
echo "1. Open browser at http://localhost:8081"
echo "2. For web app: npm run dev in web folder"
echo "3. Use browser's screenshot tool or PrintScreen"
echo ""
echo "To record a video:"
echo "1. Use OBS Studio"
echo "2. Capture browser window"
echo "3. Record at 30fps for best quality"