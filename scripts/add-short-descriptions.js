const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://strapi-production-7ecb.up.railway.app';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('Error: STRAPI_API_TOKEN environment variable is required');
  console.error('Usage: export STRAPI_API_TOKEN=your_token && node add-short-descriptions.js');
  process.exit(1);
}

const shortDescriptions = {
  'MoodChanger': 'MoodChanger is your one stop shop for all things AI. You can manage various AI systems through this app. Check out all of the exciting AI technologies being connected.',
  'CAIPO': 'CAIPO is Chief Artificial Intelligence Productivity Officer. This is a wearable AI tech that can record audio and video for note taking. The AI can assist you with summarizing or finding sections of your notes.',
  'Flo Studios': 'Flo Studios is our content creation hub for our interns. We want to focus on all types of contents. We currently have our own podcast The Flo Frequency.',
  'Flo Travel': 'AI is taking over in the market for travel. Flo Travel is using AI to help clients plan their trips accordingly. Plan your flight, hotel, trip, activites, etc. all in one place.',
  'Flo Labs': '**What The Project Is:** The official portal for Flo Labs\' Research and Development.\n\n**Current Work:** Redesigning the site to reflect ongoing changes at Flo Labs.',
  'Flo International': '**What The Project Is:** A global platform showcasing Flo Labs\' diverse initiatives, partnerships, and cutting-edge innovations in AI and technology.\n\n**Current Work:** Redesigning the website to better highlight Flo Labs\' mission, ongoing projects, and opportunities for collaboration and internships.',
  'MoodChanger for Pets': '**What The Project Is:** Expanding MoodChanger for pet owners by using data from wearable devices, environmental factors, and AI analysis to provide actionable insights into pets\' behaviors, moods, and overall health.',
  'Humanoid Robots': '**What The Project Is:** A major milestone in our mission to push the boundaries of intelligent systems and human-robot interaction and include that interns who join our program may have the opportunity to contribute directly to this groundbreaking initiative.\n\nWe are also launching RoboCollective.ai. Our one stop shop for all our robots and our partners robots and accessories.'
};

async function updateProject(projectTitle, shortDescription) {
  try {
    // First, get the project by title
    const searchResponse = await fetch(
      `${STRAPI_URL}/api/projects?filters[title][$eq]=${encodeURIComponent(projectTitle)}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`Failed to find project: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();

    if (!searchData.data || searchData.data.length === 0) {
      console.log(`⚠️  Project "${projectTitle}" not found, skipping...`);
      return;
    }

    const project = searchData.data[0];
    const documentId = project.documentId;
    console.log(`Found project "${projectTitle}" with documentId: ${documentId}`);

    // Update the project using documentId (Strapi v5)
    const updateResponse = await fetch(`${STRAPI_URL}/api/projects/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          shortDescription: shortDescription,
        },
      }),
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update project: ${updateResponse.statusText}`);
    }

    console.log(`✅ Successfully updated "${projectTitle}" with short description`);
  } catch (error) {
    console.error(`❌ Error updating "${projectTitle}":`, error.message);
  }
}

async function main() {
  console.log('🚀 Adding short descriptions to projects...\n');
  console.log(`Strapi URL: ${STRAPI_URL}\n`);

  for (const [title, shortDesc] of Object.entries(shortDescriptions)) {
    await updateProject(title, shortDesc);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✨ Short description updates complete!');
  console.log('\nNext steps:');
  console.log('1. Update TypeScript interface to include shortDescription');
  console.log('2. Update ProjectsShowcase component to use shortDescription');
  console.log('3. Push changes and wait for Vercel deployment');
}

main();
