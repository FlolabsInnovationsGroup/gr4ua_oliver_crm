/**
 * Upload images to Strapi and create hero carousel content
 * 
 * Usage: node upload-images-to-strapi.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const STRAPI_URL = process.env.STRAPI_URL || 'https://strapi-production-7ecb.up.railway.app';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

const IMAGES_DIR = path.join(__dirname, 'images');

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_TOKEN environment variable is required');
  console.error('Get your token from Strapi Admin -> Settings -> API Tokens');
  process.exit(1);
}

/**
 * Upload a file to Strapi
 */
async function uploadToStrapi(filePath, altText) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('files', fs.createReadStream(filePath));
    
    if (altText) {
      form.append('fileInfo', JSON.stringify({
        name: path.basename(filePath, path.extname(filePath)),
        alternativeText: altText
      }));
    }

    const options = {
      hostname: new URL(STRAPI_URL).hostname,
      path: '/api/upload',
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${STRAPI_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log(`✓ Uploaded: ${path.basename(filePath)} (ID: ${response[0].id})`);
          resolve(response[0]);
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
}

/**
 * Get all internships from Strapi
 */
async function getInternships() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: new URL(STRAPI_URL).hostname,
      path: '/api/internships',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data).data);
        } else {
          reject(new Error(`Failed to get internships: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Update internship with images
 */
async function updateInternshipImages(internshipId, imageIds) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      data: {
        images: imageIds
      }
    });

    const options = {
      hostname: new URL(STRAPI_URL).hostname,
      path: `/api/internships/${internshipId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to update internship: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Main function
 */
async function main() {
  console.log('Starting Strapi image upload...\n');

  // Upload carousel images
  const carouselImages = [
    { file: 'internship-carousel-1.png', alt: 'Remote Internship Opportunities for Students' },
    { file: 'internship-carousel-2.png', alt: 'Remote Internship Opportunities for professionals across the globe' },
    { file: 'internship-carousel-3.png', alt: 'Hands-on robotics internship opportunity for remote learners' }
  ];

  const uploadedImageIds = [];

  console.log('=== Uploading Carousel Images ===\n');
  
  for (const image of carouselImages) {
    try {
      const filePath = path.join(IMAGES_DIR, image.file);
      const uploaded = await uploadToStrapi(filePath, image.alt);
      uploadedImageIds.push(uploaded.id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
    } catch (error) {
      console.error(`✗ Failed to upload ${image.file}:`, error.message);
    }
  }

  // Upload blog hero image
  console.log('\n=== Uploading Blog Hero Image ===\n');
  try {
    const blogHeroPath = path.join(IMAGES_DIR, 'blog-hero.jpg');
    await uploadToStrapi(blogHeroPath, 'Blog page hero image');
  } catch (error) {
    console.error('✗ Failed to upload blog hero:', error.message);
  }

  // Upload logo
  console.log('\n=== Uploading Logo ===\n');
  try {
    const logoPath = path.join(IMAGES_DIR, 'logo.jpg');
    await uploadToStrapi(logoPath, 'Flo Labs R&D International logo');
  } catch (error) {
    console.error('✗ Failed to upload logo:', error.message);
  }

  // Link carousel images to featured internships (first 3)
  if (uploadedImageIds.length > 0) {
    console.log('\n=== Linking Images to Featured Internships ===\n');
    
    try {
      const internships = await getInternships();
      const featuredInternships = internships.slice(0, 3); // First 3 internships
      
      for (let i = 0; i < featuredInternships.length && i < uploadedImageIds.length; i++) {
        const internship = featuredInternships[i];
        try {
          await updateInternshipImages(internship.id, [uploadedImageIds[i]]);
          console.log(`✓ Linked image to: ${internship.title}`);
        } catch (error) {
          console.error(`✗ Failed to link image to ${internship.title}:`, error.message);
        }
      }
    } catch (error) {
      console.error('✗ Failed to link images to internships:', error.message);
    }
  }

  console.log('\n=== Upload Complete ===');
  console.log('Images have been uploaded to Strapi media library.');
  console.log('\nNext steps:');
  console.log('1. Update frontend to display carousel images');
  console.log('2. Import Projects and Blog Posts');
  console.log('3. Update Projects and Blogs pages with Strapi data');
}

main().catch(console.error);
