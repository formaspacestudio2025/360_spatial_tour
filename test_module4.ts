
import { getAssetContext, generateInventoryReport, calculateDepreciation } from './backend/src/services/asset.service';
import db from './backend/src/config/database';

async function testModule4() {
  console.log('--- Testing Module 4: Asset Intelligence ---');
  
  // 1. Test getAssetContext
  const assetId = 'ab6773a8-c760-475f-893d-2ea525f9a039';
  console.log(`\n1. Testing getAssetContext for ID: ${assetId}`);
  const context = await getAssetContext(assetId);
  if (context) {
    console.log('✅ Success: Context retrieved');
    console.log(`   Asset Name: ${context.asset.name}`);
    console.log(`   Issues Count: ${context.issues.length}`);
    console.log(`   Inspections Count: ${context.inspections.length}`);
  } else {
    console.log('❌ Failed: Context not found');
  }

  // 2. Test calculateDepreciation
  console.log('\n2. Testing calculateDepreciation');
  const asset = (db.tables['assets'] as any[]).find(a => a.id === assetId);
  if (asset) {
    const dep = calculateDepreciation(asset);
    if (dep) {
      console.log('✅ Success: Depreciation calculated');
      console.log(`   Current Book Value: ${dep.currentBookValue.toFixed(2)}`);
      console.log(`   Depreciation Rate: ${dep.depreciationRate}%`);
    } else {
      console.log('ℹ️ Info: Depreciation not applicable (missing purchase info)');
    }
  }

  // 3. Test generateInventoryReport
  console.log('\n3. Testing generateInventoryReport');
  const report = await generateInventoryReport();
  if (report) {
    console.log('✅ Success: Inventory report generated');
    console.log(`   Total Assets: ${report.totalAssets}`);
    console.log(`   Total Original Value: ${report.totalOriginalValue.toFixed(2)}`);
    console.log(`   Total Current Value: ${report.totalCurrentValue.toFixed(2)}`);
  }

  console.log('\n--- Module 4 Test Complete ---');
}

testModule4().catch(console.error);
