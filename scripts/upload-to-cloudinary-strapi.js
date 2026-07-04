const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const IMAGES_DIR = path.join(__dirname, 'wordpress-images');

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_API_TOKEN environment variable is required');
  process.exit(1);
}

async function uploadImageToStrapi(filepath, filename) {
  try {
    const formData = new FormData();
    formData.append('files', fs.createReadStream(filepath), filename);

    const response = await axios.post(
      `${STRAPI_URL}/api/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${STRAPI_TOKEN}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000
      }
    );

    console.log(`✓ Uploaded: ${filename} → ${response.data[0].url}`);
    return response.data[0];
  } catch (error) {
    console.error(`✗ Failed to upload ${filename}:`, error.response?.data || error.message);
    return null;
  }
}

async function uploadAllImages() {
  // Check if images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Error: Images directory not found: ${IMAGES_DIR}`);
    console.log('Run download-wordpress-images.js first to download images from WordPress');
    process.exit(1);
  }

  // Read manifest
  const manifestPath = path.join(IMAGES_DIR, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('Error: manifest.json not found');
    console.log('Run download-wordpress-images.js first');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`Found ${manifest.images.length} images to upload\n`);

  const uploaded = [];
  const failed = [];

  for (const image of manifest.images) {
    if (fs.existsSync(image.filepath)) {
      const result = await uploadImageToStrapi(image.filepath, image.filename);
      if (result) {
        uploaded.push({ ...image, strapiId: result.id, cloudinaryUrl: result.url });
      } else {
        failed.push(image);
      }
      // Rate limit: wait 500ms between uploads
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      console.warn(`⚠ File not found: ${image.filepath}`);
      failed.push(image);
    }
  }

  console.log(`\n\n✓ Upload complete!`);
  console.log(`  Uploaded: ${uploaded.length}`);
  console.log(`  Failed: ${failed.length}`);

  // Save upload results
  const results = {
    uploadedAt: new Date().toISOString(),
    strapiUrl: STRAPI_URL,
    uploaded,
    failed
  };

  fs.writeFileSync(
    path.join(IMAGES_DIR, 'upload-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log(`\n✓ Results saved to ${IMAGES_DIR}/upload-results.json`);

  if (failed.length > 0) {
    console.log('\nFailed uploads:');
    failed.forEach(img => console.log(`  - ${img.filename}`));
  }
}

// Run the script
uploadAllImages()
  .then(() => {
    console.log('\n✓ All done! Images are now stored in Cloudinary via Strapi');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
