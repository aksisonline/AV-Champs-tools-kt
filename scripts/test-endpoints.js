// test-endpoints.js
// A simple script to test the API endpoints for the tools

async function testEndpoints() {
  console.log('Testing API endpoints...');
  
  // Test the main tools endpoint with premium=false
  try {
    const regularToolsResponse = await fetch('http://localhost:3000/api/tools?premium=false');
    const regularTools = await regularToolsResponse.json();
    console.log(`Regular tools (premium=false): ${regularTools.length} tools found`);
    console.log('All regular tools:', regularTools.map(tool => tool.name).join(', '));
  } catch (error) {
    console.error('Error testing regular tools endpoint:', error);
  }
    // Test the main tools endpoint with premium=true
  try {
    const premiumToolsResponse = await fetch('http://localhost:3000/api/tools?premium=true');
    const premiumTools = await premiumToolsResponse.json();
    console.log(`Premium tools (premium=true): ${premiumTools.length} tools found`);
    console.log('First premium tool:', premiumTools[0]?.name);
  } catch (error) {
    console.error('Error testing premium tools endpoint:', error);
  }
  
  // Test the purchase endpoint (this would typically be a POST request)
  console.log('Note: Purchase endpoint would need to be tested with an actual POST request');
}

// Run the tests
testEndpoints();
