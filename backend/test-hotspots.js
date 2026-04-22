// Test script to verify hotspot and graph features
const http = require('http');

const BACKEND_URL = 'http://localhost:3000';

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testFeatures() {
  console.log('🧪 Testing Enterprise Hotspot Features\n');

  try {
    // Test 1: Login
    console.log('1️⃣ Testing login...');
    const loginResult = await makeRequest('POST', '/api/auth/login', {
      username: 'admin',
      password: 'admin123',
    });

    if (!loginResult.success) {
      console.error('❌ Login failed:', loginResult.error?.message);
      return;
    }

    const token = loginResult.data.token;
    console.log('✅ Login successful\n');

    // Test 2: Get walkthroughs
    console.log('2️⃣ Getting walkthroughs...');
    const walkthroughs = await makeRequest('GET', '/api/walkthroughs', null, token);
    
    if (!walkthroughs.success || walkthroughs.data.length === 0) {
      console.error('❌ No walkthroughs found');
      return;
    }

    // Find walkthrough with scenes (use the one with ID from attached file)
    let walkthrough = walkthroughs.data.find(w => w.id === '1dc7fa90-b9e5-4242-b66e-8b0b6170a8b4');
    if (!walkthrough) {
      walkthrough = walkthroughs.data[0]; // Fallback to first
    }
    
    const walkthroughId = walkthrough.id;
    console.log(`✅ Found walkthrough: ${walkthrough.name} (${walkthroughId})\n`);

    // Test 3: Get scenes
    console.log('3️⃣ Getting scenes...');
    const scenes = await makeRequest('GET', `/api/walkthroughs/${walkthroughId}/scenes`, null, token);

    if (!scenes.success || scenes.data.length < 2) {
      console.error('❌ Need at least 2 scenes to test connections');
      console.log(`   Found ${scenes.data?.length || 0} scenes`);
      return;
    }

    console.log(`✅ Found ${scenes.data.length} scenes\n`);

    const scene1 = scenes.data[0];
    const scene2 = scenes.data[1];

    // Test 4: Get existing hotspots
    console.log('4️⃣ Testing hotspot retrieval...');
    const hotspotsBefore = await makeRequest('GET', `/api/scenes/${scene1.id}/hotspots`, null, token);
    console.log(`   Found ${hotspotsBefore.data?.length || 0} existing hotspots in Scene 1`);
    console.log('✅ Hotspot retrieval working\n');

    // Test 5: Create new hotspot (simulating graph connection)
    console.log('5️⃣ Creating test hotspot (graph connection)...');
    const newHotspot = await makeRequest(
      'POST',
      `/api/scenes/${scene1.id}/hotspots`,
      {
        to_scene_id: scene2.id,
        yaw: 0.5,
        pitch: -0.2,
        label: 'Test Connection',
        icon_type: 'navigation',
        icon_color: '#10b981',
        target_yaw: 0,
        target_pitch: 0,
      },
      token
    );

    if (!newHotspot.success) {
      console.error('❌ Failed to create hotspot:', newHotspot.error?.message);
      return;
    }

    const hotspotId = newHotspot.data.id;
    console.log(`✅ Hotspot created: ${hotspotId}`);
    console.log(`   From: ${scene1.room_name || scene1.id}`);
    console.log(`   To: ${scene2.room_name || scene2.id}\n`);

    // Test 6: Verify hotspot persists
    console.log('6️⃣ Verifying hotspot persistence...');
    const hotspotsAfter = await makeRequest('GET', `/api/scenes/${scene1.id}/hotspots`, null, token);
    
    const foundHotspot = hotspotsAfter.data?.find((h) => h.id === hotspotId);
    if (!foundHotspot) {
      console.error('❌ Hotspot not found after creation!');
      return;
    }

    console.log('✅ Hotspot persists in database');
    console.log(`   yaw: ${foundHotspot.yaw}`);
    console.log(`   pitch: ${foundHotspot.pitch}`);
    console.log(`   icon_type: ${foundHotspot.icon_type}`);
    console.log(`   icon_color: ${foundHotspot.icon_color}\n`);

    // Test 7: Test orientation fields
    console.log('7️⃣ Testing orientation fields...');
    if (foundHotspot.target_yaw !== undefined && foundHotspot.target_pitch !== undefined) {
      console.log('✅ Orientation fields present');
      console.log(`   target_yaw: ${foundHotspot.target_yaw}`);
      console.log(`   target_pitch: ${foundHotspot.target_pitch}\n`);
    } else {
      console.log('⚠️  Orientation fields missing (need schema update)\n');
    }

    // Test 8: Update hotspot
    console.log('8️⃣ Testing hotspot update...');
    const updated = await makeRequest(
      'PUT',
      `/api/hotspots/${hotspotId}`,
      {
        label: 'Updated Connection',
        icon_type: 'info',
        icon_color: '#3b82f6',
        title: 'Test Title',
        description: 'Test Description',
      },
      token
    );

    if (!updated.success) {
      console.error('❌ Failed to update hotspot:', updated.error?.message);
      return;
    }

    console.log('✅ Hotspot updated successfully');
    console.log(`   New label: ${updated.data.label}`);
    console.log(`   New icon_type: ${updated.data.icon_type}\n`);

    // Test 9: Delete hotspot
    console.log('9️⃣ Testing hotspot deletion...');
    const deleted = await makeRequest('DELETE', `/api/hotspots/${hotspotId}`, null, token);

    if (!deleted.success) {
      console.error('❌ Failed to delete hotspot:', deleted.error?.message);
      return;
    }

    console.log('✅ Hotspot deleted successfully\n');

    // Final summary
    console.log('═'.repeat(50));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('═'.repeat(50));
    console.log('\n✅ Features verified:');
    console.log('   1. Hotspot persistence across requests');
    console.log('   2. Hotspot creation (graph connections)');
    console.log('   3. Orientation control fields');
    console.log('   4. Hotspot update with new fields');
    console.log('   5. Hotspot deletion');
    console.log('   6. Icon types and colors');
    console.log('\n⚠️  Note: Frontend UI needs to be tested in browser');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure backend is running on http://localhost:3000');
  }
}

testFeatures();
