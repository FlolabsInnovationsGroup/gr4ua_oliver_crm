/**
 * Update Benefits and Verticals icon fields from filenames to full Cloudinary URLs
 */

const fs = require('fs');
const path = require('path');

const STRAPI_URL = 'https://strapi-production-7ecb.up.railway.app';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('Error: STRAPI_API_TOKEN environment variable is required');
  process.exit(1);
}

// Load upload results to get filename -> Cloudinary URL mapping
const uploadResults = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'wordpress-images/upload-results.json'), 'utf8')
);

// Create mapping: filename -> cloudinaryUrl
const iconMapping = {};
uploadResults.uploaded.forEach(img => {
  if (img.filename && img.cloudinaryUrl) {
    iconMapping[img.filename] = img.cloudinaryUrl;
  }
});

console.log('📋 Icon URL mapping:', iconMapping);
console.log('');

async function updateBenefits() {
  console.log('🔄 Updating Benefits...');
  
  // Get all benefits
  const response = await fetch(`${STRAPI_URL}/api/benefits`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_API_TOKEN}`
    }
  });
  
  const { data: benefits } = await response.json();
  console.log(`Found ${benefits.length} benefits`);
  
  for (const benefit of benefits) {
    if (benefit.icon && iconMapping[benefit.icon]) {
      const newIconUrl = iconMapping[benefit.icon];
      
      console.log(`  Updating "${benefit.title}": ${benefit.icon} -> ${newIconUrl}`);
      
      const updateResponse = await fetch(`${STRAPI_URL}/api/benefits/${benefit.documentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            icon: newIconUrl
          }
        })
      });
      
      if (!updateResponse.ok) {
        console.error(`    ❌ Failed: ${updateResponse.statusText}`);
      } else {
        console.log(`    ✅ Updated`);
      }
    } else if (benefit.icon) {
      console.log(`  ⚠️  No mapping found for "${benefit.title}": ${benefit.icon}`);
    }
  }
}

async function updateVerticals() {
  console.log('\n🔄 Updating Verticals...');
  
  // Get all verticals
  const response = await fetch(`${STRAPI_URL}/api/verticals`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_API_TOKEN}`
    }
  });
  
  const { data: verticals } = await response.json();
  console.log(`Found ${verticals.length} verticals`);
  
  for (const vertical of verticals) {
    if (vertical.icon && iconMapping[vertical.icon]) {
      const newIconUrl = iconMapping[vertical.icon];
      
      console.log(`  Updating "${vertical.title}": ${vertical.icon} -> ${newIconUrl}`);
      
      const updateResponse = await fetch(`${STRAPI_URL}/api/verticals/${vertical.documentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            icon: newIconUrl
          }
        })
      });
      
      if (!updateResponse.ok) {
        console.error(`    ❌ Failed: ${updateResponse.statusText}`);
      } else {
        console.log(`    ✅ Updated`);
      }
    } else if (vertical.icon) {
      console.log(`  ⚠️  No mapping found for "${vertical.title}": ${vertical.icon}`);
    }
  }
}

async function main() {
  try {
    await updateBenefits();
    await updateVerticals();
    console.log('\n✨ Icon URL updates complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
