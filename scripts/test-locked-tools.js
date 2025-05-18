// test-locked-tools.js
// A script to test the behavior of locked tools in the system

async function testLockedTools() {
  console.log('Testing locked tools functionality...');
  
  // 1. Test non-premium tools with pointsRequired = 0 (should be directly accessible)
  console.log('\nTesting non-premium tools with pointsRequired = 0:');
  try {
    const response = await fetch('http://localhost:3000/api/tools?premium=false');
    const tools = await response.json();
    
    const directAccessTools = tools.filter(tool => 
      !tool.isPremium && (tool.pointsRequired === 0 || tool.pointsRequired === undefined)
    );
    
    console.log(`Found ${directAccessTools.length} directly accessible tools:`);
    directAccessTools.forEach(tool => {
      console.log(`- ${tool.name} (id: ${tool.id}, pointsRequired: ${tool.pointsRequired || 0})`);
    });
  } catch (error) {
    console.error('Error testing directly accessible tools:', error);
  }
  
  // 2. Test non-premium tools with pointsRequired > 0 (should be locked)
  console.log('\nTesting non-premium tools with pointsRequired > 0:');
  try {
    const response = await fetch('http://localhost:3000/api/tools?premium=false');
    const tools = await response.json();
    
    const lockedNonPremiumTools = tools.filter(tool => 
      !tool.isPremium && (tool.pointsRequired || 0) > 0
    );
    
    console.log(`Found ${lockedNonPremiumTools.length} locked non-premium tools:`);
    lockedNonPremiumTools.forEach(tool => {
      console.log(`- ${tool.name} (id: ${tool.id}, pointsRequired: ${tool.pointsRequired})`);
    });
  } catch (error) {
    console.error('Error testing locked non-premium tools:', error);
  }
  
  // 3. Test premium tools (should all be locked)
  console.log('\nTesting premium tools:');
  try {
    const response = await fetch('http://localhost:3000/api/tools?premium=true');
    const tools = await response.json();
    
    console.log(`Found ${tools.length} premium tools:`);
    tools.forEach(tool => {
      console.log(`- ${tool.name} (id: ${tool.id}, pointsRequired: ${tool.pointsRequired})`);
    });
  } catch (error) {
    console.error('Error testing premium tools:', error);
  }
}

// Run the tests
testLockedTools();
