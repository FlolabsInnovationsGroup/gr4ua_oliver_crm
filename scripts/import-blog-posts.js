/**
 * WordPress Blog Posts to Strapi Import Script
 * 
 * This script parses the WordPress XML export and imports blog posts to Strapi.
 * Run with: STRAPI_API_TOKEN="your-token" node import-blog-posts.js
 */

const fs = require('fs');
const https = require('https');
const { XMLParser } = require('fast-xml-parser');

// Configuration
const STRAPI_URL = 'https://strapi-production-7ecb.up.railway.app';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const XML_FILE = '/Users/elizabethstein/Downloads/flolabsrampdinternational.WordPress.2025-11-07.xml';

if (!STRAPI_API_TOKEN) {
  console.error('❌ ERROR: STRAPI_API_TOKEN environment variable is required');
  console.log('Set it with: export STRAPI_API_TOKEN="your-token-here"');
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, data: data ? JSON.parse(data) : null });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
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

// Check if blog post exists by slug
async function blogPostExists(slug) {
  try {
    const response = await makeRequest(
      `${STRAPI_URL}/api/blog-posts?filters[slug][$eq]=${encodeURIComponent(slug)}`
    );
    return response.data.data && response.data.data.length > 0;
  } catch (error) {
    console.error(`Error checking if blog post exists: ${error.message}`);
    return false;
  }
}

// Create blog post in Strapi
async function createBlogPost(blogPost) {
  try {
    const response = await makeRequest(`${STRAPI_URL}/api/blog-posts`, {
      method: 'POST',
      body: { data: blogPost }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create blog post: ${error.message}`);
  }
}

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Extract excerpt from content
function extractExcerpt(content, maxLength = 200) {
  if (!content) return '';
  
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (text.length <= maxLength) return text;
  
  // Cut at word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}

// Parse blog post from WordPress item
function parseBlogPost(item) {
  const title = item.title || 'Untitled Post';
  const slug = item['wp:post_name'] || generateSlug(title);
  
  // Get content
  const content = item['content:encoded'] || item.description || '';
  
  // Get excerpt
  let excerpt = item['excerpt:encoded'] || extractExcerpt(content);
  
  // Get publish date
  const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
  
  // Get status
  const wpStatus = item['wp:status'] || 'draft';
  const published = wpStatus === 'publish';
  
  // Get author
  const author = item['dc:creator'] || 'Admin';
  
  // Get categories/tags
  let categories = [];
  let tags = [];
  
  if (item.category) {
    const cats = Array.isArray(item.category) ? item.category : [item.category];
    cats.forEach(cat => {
      if (typeof cat === 'object' && cat['@_domain']) {
        if (cat['@_domain'] === 'category') {
          categories.push(cat['#text'] || cat);
        } else if (cat['@_domain'] === 'post_tag') {
          tags.push(cat['#text'] || cat);
        }
      } else if (typeof cat === 'string') {
        categories.push(cat);
      }
    });
  }
  
  return {
    title,
    slug,
    content,
    excerpt,
    publishedDate: published ? pubDate : null,
    author,
    tags: tags.length > 0 ? tags : (categories.length > 0 ? categories : [])
  };
}

// Main import function
async function importBlogPosts() {
  console.log('🚀 WordPress Blog Posts to Strapi Import\n');
  console.log(`📁 Reading: ${XML_FILE}`);
  
  // Read and parse XML
  const xml = fs.readFileSync(XML_FILE, 'utf8');
  const parser = new XMLParser({ 
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  const result = parser.parse(xml);
  
  const items = result.rss?.channel?.item || [];
  console.log(`📊 Found ${items.length} total items in WordPress export\n`);
  
  // Filter for blog posts
  const blogPosts = items.filter(item => item['wp:post_type'] === 'post');
  
  console.log(`📝 Found ${blogPosts.length} blog posts\n`);
  
  if (blogPosts.length === 0) {
    console.log('⚠️  No blog posts found.');
    return;
  }
  
  // Import each blog post
  let imported = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const post of blogPosts) {
    const blogPost = parseBlogPost(post);
    
    console.log(`\n📝 Processing: ${blogPost.title}`);
    console.log(`   Slug: ${blogPost.slug}`);
    console.log(`   Published: ${blogPost.publishedDate ? 'Yes' : 'No (draft)'}`);
    console.log(`   Author: ${blogPost.author}`);
    
    try {
      // Check if already exists
      const exists = await blogPostExists(blogPost.slug);
      
      if (exists) {
        console.log('   ⏭️  Already exists, skipping');
        skipped++;
        continue;
      }
      
      // Create in Strapi
      await createBlogPost(blogPost);
      console.log('   ✅ Imported successfully');
      imported++;
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      failed++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Imported: ${imported}`);
  console.log(`⏭️  Skipped (already exist): ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📋 Total processed: ${blogPosts.length}`);
  console.log('='.repeat(50) + '\n');
}

// Run the import
importBlogPosts().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
