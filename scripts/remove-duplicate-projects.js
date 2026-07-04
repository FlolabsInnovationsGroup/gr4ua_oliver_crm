#!/usr/bin/env node

/**
 * Remove duplicate projects from Strapi
 * Keeps the project with the lowest order number for each title
 */

const STRAPI_URL = process.env.STRAPI_URL || 'https://strapi-production-7ecb.up.railway.app';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('❌ STRAPI_API_TOKEN environment variable is required');
  process.exit(1);
}

async function removeDuplicateProjects() {
  try {
    // Fetch all projects
    const response = await fetch(`${STRAPI_URL}/api/projects?sort=order:asc`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const projects = data.data;

    console.log(`\n📋 Found ${projects.length} total projects`);

    // Group projects by title
    const projectsByTitle = {};
    projects.forEach(project => {
      if (!projectsByTitle[project.title]) {
        projectsByTitle[project.title] = [];
      }
      projectsByTitle[project.title].push(project);
    });

    // Find duplicates and delete them
    let deletedCount = 0;
    for (const [title, projectList] of Object.entries(projectsByTitle)) {
      if (projectList.length > 1) {
        console.log(`\n🔍 Found ${projectList.length} instances of "${title}"`);
        
        // Sort by order to keep the first one
        projectList.sort((a, b) => a.order - b.order);
        
        // Keep the first one, delete the rest
        const toKeep = projectList[0];
        const toDelete = projectList.slice(1);
        
        console.log(`   ✅ Keeping: ID ${toKeep.id} (order: ${toKeep.order})`);
        
        for (const project of toDelete) {
          console.log(`   🗑️  Deleting: ID ${project.id} (order: ${project.order})`);
          
          const deleteResponse = await fetch(`${STRAPI_URL}/api/projects/${project.documentId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
            },
          });

          if (deleteResponse.ok) {
            console.log(`   ✅ Deleted successfully`);
            deletedCount++;
          } else {
            const errorText = await deleteResponse.text();
            console.log(`   ❌ Failed to delete: ${deleteResponse.status} ${errorText}`);
          }
        }
      }
    }

    console.log(`\n✨ Cleanup complete! Deleted ${deletedCount} duplicate projects.\n`);

  } catch (error) {
    console.error('❌ Error removing duplicate projects:', error.message);
    process.exit(1);
  }
}

removeDuplicateProjects();
