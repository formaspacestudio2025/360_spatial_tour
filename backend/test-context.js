require('ts-node/register');
const { getAssetContext } = require('./src/services/asset.service');

async function test() {
  const ctxLite = await getAssetContext("ab6773a8-c760-475f-893d-2ea525f9a039");
  console.log('Lite issues:', ctxLite.issues.length);
  
  const ctxEee = await getAssetContext("bfabacd8-ef58-4c67-8857-e226697f89df");
  console.log('Eee issues:', ctxEee.issues.length);
}

test();
