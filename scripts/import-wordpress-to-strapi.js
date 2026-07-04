/**
 * WordPress to Strapi Import Script
 * 
 * This script parses a WordPress XML export and imports internships to Railway Strapi.
 * Run with: node import-wordpress-to-strapi.js <path-to-wordpress-xml>
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { XMLParser } = require('fast-xml-parser');

// Configuration
const STRAPI_URL = 'https://strapi-production-7ecb.up.railway.app';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN; // Set this in your environment

// Parse command line arguments
const xmlFilePath = process.argv[2] || '/Users/elizabethstein/Downloads/flolabsrampdinternational.WordPress.2025-11-07.xml';

if (!STRAPI_API_TOKEN) {
  console.error('❌ ERROR: STRAPI_API_TOKEN environment variable is required');
  console.log('');
  console.log('To get your API token:');
  console.log('1. Go to https://strapi-production-7ecb.up.railway.app/admin');
  console.log('2. Navigate to Settings > API Tokens');
  console.log('3. Create a new token with "Full access" permissions');
  console.log('4. Set it in your environment: export STRAPI_API_TOKEN="your-token-here"');
  console.log('5. Run this script again');
  process.exit(1);
}

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Helper function to create a slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to extract plain text from HTML
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

// Parse internship data from WordPress post
function parseInternshipFromPost(post) {
  const postmeta = Array.isArray(post['wp:postmeta']) ? post['wp:postmeta'] : [post['wp:postmeta']].filter(Boolean);
  
  // Extract custom fields
  const getMetaValue = (key) => {
    const meta = postmeta.find(m => m['wp:meta_key'] === key);
    return meta ? stripHtml(meta['wp:meta_value']) : '';
  };

  const title = post.title || 'Untitled Position';
  const slug = createSlug(title);
  
  // Extract description from content
  let description = stripHtml(post['content:encoded'] || post.description || '');
  
  // Parse location
  const location = getMetaValue('_job_location') || getMetaValue('location') || 'Remote';
  
  // Parse status
  let status = 'Open';
  const postStatus = post['wp:status'];
  if (postStatus === 'draft' || postStatus === 'private') {
    status = 'Closed';
  }
  
  // Try to extract requirements and responsibilities from description
  let requirements = [];
  let responsibilities = [];
  
  // Look for common section markers in description
  const reqMatch = description.match(/(?:requirements?|qualifications?|skills?)[\s:]+([^\n]+(?:\n[^\n]+)*?)(?=\n\n|responsibilities|duties|$)/i);
  if (reqMatch) {
    requirements = reqMatch[1]
      .split(/\n|•|[-–]/)
      .map(r => r.trim())
      .filter(r => r.length > 10 && r.length < 200)
      .slice(0, 10);
  }
  
  const respMatch = description.match(/(?:responsibilities|duties|you will)[\s:]+([^\n]+(?:\n[^\n]+)*?)(?=\n\n|requirements|qualifications|$)/i);
  if (respMatch) {
    responsibilities = respMatch[1]
      .split(/\n|•|[-–]/)
      .map(r => r.trim())
      .filter(r => r.length > 10 && r.length < 200)
      .slice(0, 10);
  }
  
  // Default HubSpot form ID (can be customized per internship type)
  const hubspotFormId = '0133caf3-53e5-403f-a894-cd0246642913';
  
  // Convert arrays to markdown bullet lists for richtext fields
  const defaultRequirements = [
    'Bachelor\'s degree in relevant field or equivalent experience',
    'Strong problem-solving and analytical skills',
    'Excellent communication and teamwork abilities'
  ];
  const defaultResponsibilities = [
    'Work on assigned projects and tasks',
    'Collaborate with team members',
    'Learn and apply new technologies'
  ];
  
  const reqArray = requirements.length > 0 ? requirements : defaultRequirements;
  const respArray = responsibilities.length > 0 ? responsibilities : defaultResponsibilities;
  
  return {
    title,
    slug,
    status,
    location,
    description: description.substring(0, 5000), // Limit description length
    requirements: reqArray.map(r => `- ${r}`).join('\n'),
    responsibilities: respArray.map(r => `- ${r}`).join('\n'),
    hubspotFormId
  };
}

// Check if internship already exists
async function internshipExists(slug) {
  try {
    const response = await makeRequest(`${STRAPI_URL}/api/internships?filters[slug][$eq]=${slug}`);
    return response.data && response.data.length > 0;
  } catch (error) {
    console.error(`Error checking if internship exists: ${error.message}`);
    return false;
  }
}

// Create internship in Strapi
async function createInternship(data) {
  try {
    const response = await makeRequest(`${STRAPI_URL}/api/internships`, {
      method: 'POST',
      body: {
        data
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create internship: ${error.message}`);
  }
}

// Main import function
async function importWordPressData() {
  console.log('🚀 Starting WordPress to Strapi import...\n');
  
  // Check if XML file exists
  if (!fs.existsSync(xmlFilePath)) {
    console.error(`❌ ERROR: XML file not found at ${xmlFilePath}`);
    process.exit(1);
  }
  
  console.log(`📄 Reading XML file: ${xmlFilePath}`);
  const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
  
  console.log('🔍 Parsing XML data...');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '_',
    parseTagValue: false
  });
  const parsed = parser.parse(xmlData);
  
  // Extract posts from WordPress export
  const channel = parsed.rss?.channel;
  if (!channel) {
    console.error('❌ ERROR: Invalid WordPress XML format');
    process.exit(1);
  }
  
  let items = channel.item;
  if (!Array.isArray(items)) {
    items = [items].filter(Boolean);
  }
  
  console.log(`📊 Found ${items.length} total items in WordPress export\n`);
  
  // Filter for internship posts
  const internshipPosts = items.filter(item => {
    const postType = item['wp:post_type'];
    const title = (item.title || '').toLowerCase();
    
    // Check category for intern keyword
    let hasInternCategory = false;
    if (item.category) {
      const categories = Array.isArray(item.category) ? item.category : [item.category];
      hasInternCategory = categories.some(cat => 
        typeof cat === 'string' && cat.toLowerCase().includes('intern')
      );
    }
    
    // Look for internship-related posts
    return postType === 'job_listing' || 
           postType === 'internship' || 
           title.includes('intern') ||
           hasInternCategory;
  });
  
  console.log(`🎯 Found ${internshipPosts.length} internship-related posts\n`);
  
  if (internshipPosts.length === 0) {
    console.log('⚠️  No internship posts found. Showing first 5 post types:');
    items.slice(0, 5).forEach(item => {
      console.log(`  - ${item.title} (${item['wp:post_type']})`);
    });
    console.log('\nTip: Adjust the filter logic if your posts use different types/categories');
    return;
  }
  
  // Import each internship
  let imported = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const post of internshipPosts) {
    const internship = parseInternshipFromPost(post);
    
    console.log(`\n📝 Processing: ${internship.title}`);
    console.log(`   Slug: ${internship.slug}`);
    console.log(`   Status: ${internship.status}`);
    console.log(`   Location: ${internship.location}`);
    
    try {
      // Check if already exists
      const exists = await internshipExists(internship.slug);
      if (exists) {
        console.log(`   ⏭️  Skipped (already exists)`);
        skipped++;
        continue;
      }
      
      // Create in Strapi
      await createInternship(internship);
      console.log(`   ✅ Imported successfully`);
      imported++;
      
      // Rate limiting - wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      failed++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully imported: ${imported}`);
  console.log(`⏭️  Skipped (duplicates):  ${skipped}`);
  console.log(`❌ Failed:                ${failed}`);
  console.log(`📝 Total processed:       ${internshipPosts.length}`);
  console.log('='.repeat(50));
  console.log('\n✨ Import complete!');
  console.log(`\n🌐 View your internships at: ${STRAPI_URL}/admin/content-manager/collection-types/api::internship.internship`);
}

// Run the import
importWordPressData().catch(error => {
  console.error('\n❌ FATAL ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
});
