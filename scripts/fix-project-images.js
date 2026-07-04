#!/usr/bin/env node

/**
 * Fix project images mapping based on WordPress site
 * 
 * Correct mapping from WordPress:
 * - MoodChanger: Frame-3-1.jpg (smartphone with app interface)
 * - CAIPO: Frame-2-2.jpg (wearable device)
 * - Flo Studios: Frame-4.jpg (podcast/studio logo)
 * - Flo Travel: Frame-5-3.jpg (travel app interface)
 * - Flo Labs: image-1.png (company logo)
 * - Flo International: Group-1.png (international graphic)
 * - MoodChanger for Pets: Frame-6.jpg (pet-related)
 * - Humanoid Robots: Frame-1-59.png (robot image)
 */

const fs = require('fs');
const path = require('path');

const STRAPI_URL = process.env.STRAPI_URL || 'https://strapi-production-7ecb.up.railway.app';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('❌ STRAPI_API_TOKEN environment variable is required');
  process.exit(1);
}

// Load the upload results to get Strapi IDs for images
const uploadResultsPath = path.join(__dirname, 'wordpress-images', 'upload-results.json');
const uploadResults = JSON.parse(fs.readFileSync(uploadResultsPath, 'utf8'));

// Create a map of filename to Strapi media ID
const filenameToId = {};
uploadResults.uploaded.forEach(img => {
  filenameToId[img.filename] = img.strapiId;
});

// Correct project-to-image mapping based on WordPress
const projectImageMapping = {
  'MoodChanger': ['Frame-3-1.jpg'],
  'CAIPO': ['Frame-2-2.jpg'],
  'Flo Studios': ['Frame-4.jpg'],
  'Flo Travel': ['Frame-5-3.jpg'],
  'Flo Labs': ['image-1.png'],
  'Flo International': ['Group-1.png'],
  'MoodChanger for Pets': ['Frame-6.jpg'],
  'Humanoid Robots': ['Frame-1-59.png'],
};

async function updateProjectImages() {
  try {
    // Fetch all projects
    const response = await fetch(`${STRAPI_URL}/api/projects`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const projects = data.data;

    console.log(`\n📋 Found ${projects.length} projects`);

    // Group projects by title (some may be duplicates)
    const projectsByTitle = {};
    projects.forEach(project => {
      if (!projectsByTitle[project.title]) {
        projectsByTitle[project.title] = [];
      }
      projectsByTitle[project.title].push(project);
    });

    // Update each unique project title
    for (const [projectTitle, projectList] of Object.entries(projectsByTitle)) {
      const imageFilenames = projectImageMapping[projectTitle];
      
      if (!imageFilenames) {
        console.log(`⚠️  No image mapping for "${projectTitle}" - skipping`);
        continue;
      }

      // Get Strapi media IDs for these images
      const imageIds = imageFilenames
        .map(filename => filenameToId[filename])
        .filter(id => id !== undefined);

      if (imageIds.length === 0) {
        console.log(`❌ No Strapi media IDs found for ${projectTitle} images: ${imageFilenames.join(', ')}`);
        continue;
      }

      console.log(`\n🔄 Updating ${projectTitle} (${projectList.length} instances) with images: ${imageFilenames.join(', ')}`);

      // Update all instances of this project
      for (const project of projectList) {
        const updateResponse = await fetch(`${STRAPI_URL}/api/projects/${project.documentId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              images: imageIds,
            },
          }),
        });

        if (updateResponse.ok) {
          console.log(`   ✅ Updated project ID ${project.id} (documentId: ${project.documentId})`);
        } else {
          const errorText = await updateResponse.text();
          console.log(`   ❌ Failed to update project ID ${project.id}: ${updateResponse.status} ${errorText}`);
        }
      }
    }

    console.log('\n✨ Project images update complete!\n');

  } catch (error) {
    console.error('❌ Error updating project images:', error.message);
    process.exit(1);
  }
}

updateProjectImages();
