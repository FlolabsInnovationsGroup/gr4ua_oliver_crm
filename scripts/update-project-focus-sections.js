const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://strapi-production-7ecb.up.railway.app';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('Error: STRAPI_API_TOKEN environment variable is required');
  console.error('Usage: export STRAPI_API_TOKEN=your_token && node update-project-focus-sections.js');
  process.exit(1);
}

const projectUpdates = {
  'CAIPO': {
    description: `<p><strong>What Project Is:</strong> CAIPO is Chief Artificial Intelligence Productivity Officer. This is a wearable AI tech that can record audio and video for note taking. The AI can assist you with summarizing or finding sections of your notes.</p>

<p><strong>Current Work:</strong> Actively developing CAIPO to incorporate state-of-the-art features, including real-time data analytics, industry-specific AI models, and user-friendly interfaces tailored to streamline workflows and enhance decision-making.</p>

<h4>Focus</h4>
<ul>
<li><strong>Design Excellence:</strong> Our UX/UI team will lead the creation of intuitive, impactful digital experiences.</li>
<li><strong>Improving Productivity:</strong> We want to increase productivity for businesses and individual with the latest innovations in AI technologies.</li>
<li><strong>Entrepreneurial Spirit:</strong> CAIPO embodies the startup culture, focusing on launching innovative projects and empowering creators to bring their ideas to life.</li>
</ul>`
  },
  'MoodChanger': {
    description: `<p><strong>What Project Is:</strong> An AI-powered platform designed to enhance emotional well-being. It leverages advanced AI models to analyze user inputs and generate practical advice to improve happiness and reduce stress.</p>

<p><strong>Current Work:</strong> Expanding MoodChanger's functionality by integrating interactive AI tools, refining algorithms for better personalization, and designing a user-friendly interface to make emotional health accessible to everyone.</p>

<h4>Focus</h4>
<ul>
<li><strong>Design Excellence:</strong> Our UX/UI team will lead the creation of intuitive, impactful digital experiences.</li>
<li><strong>AI Connectivity Innovation:</strong> We want to bridge together the greatest AI innovations into one place. This app will allow you to access all your AI devices and provide you with the management tools.</li>
<li><strong>Entrepreneurial Spirit:</strong> MoodChanger embodies the startup culture, focusing on launching innovative projects and empowering creators to bring their ideas to life.</li>
</ul>`
  },
  'MoodChanger for Pets': {
    description: `<p><strong>What The Project Is:</strong> Expanding MoodChanger for pet owners by using data from wearable devices, environmental factors, and AI analysis to provide actionable insights into pets' behaviors, moods, and overall health.</p>

<p><strong>Current Work:</strong> Developing a seamless platform that integrates with pet wearables, creating AI models for real-time analysis, and designing engaging tools for pet owners to monitor and enhance their pets' quality of life.</p>

<h4>Focus</h4>
<ul>
<li><strong>Design Excellence:</strong> Our UX/UI team will lead the creation of intuitive, impactful digital experiences.</li>
<li><strong>Pet Communication:</strong> We want you to be able to communicate with your pets with ease. The app is designed to understand your pets needs and be able to provide your pets current health status.</li>
<li><strong>Entrepreneurial Spirit:</strong> MoodChanger for Pets embodies the startup culture, focusing on launching innovative projects and empowering creators to bring their ideas to life.</li>
</ul>`
  },
  'Humanoid Robots': {
    description: `<p><strong>What The Project Is:</strong> A major milestone in our mission to push the boundaries of intelligent systems and human-robot interaction and include that interns who join our program may have the opportunity to contribute directly to this groundbreaking initiative.</p>

<p>We are also launching <strong>RoboCollective.ai</strong>. Our one stop shop for all our robots and our partners robots and accessories.</p>

<p><strong>Current Work:</strong> We are communicating with many robot manufacturers to showcase and sell their products. The future of robotics and a dealership come together and we're looking for ways for people to customize their very own robot.</p>

<h4>Focus</h4>
<ul>
<li><strong>Design Excellence:</strong> Our UX/UI team will lead the creation of intuitive, impactful digital experiences.</li>
<li><strong>Multimedia Innovation:</strong> We're venturing into podcasting, influencer marketing, and even film production using cutting-edge AI tools like Sora to revolutionize storytelling.</li>
<li><strong>Entrepreneurial Spirit:</strong> Flo Studios embodies the startup culture, focusing on launching innovative projects and empowering creators to bring their ideas to life.</li>
</ul>`
  },
  'Flo Studios': {
    description: `<p><strong>What The Project Is:</strong> Flo Studios will serve as a hub for creativity and innovation, bringing together UX/UI designers, multimedia creators, and marketing strategists to work on groundbreaking internal projects. We are currently upgrading and launching several new websites, including Flo Studios and our Robot Dealership site. If you're interested in website development, this could be a great opportunity to get involved.</p>

<p>While AI is a core focus of Flo Labs, we're excited to announce <strong>Flo Studios</strong>, a new creative agency within our company.</p>

<p><strong>Current Work:</strong> Our first production is a film project inspired by the mythological roots of Lemnos, Greece, blending ancient tales with the future of AI and robotics. The story highlights Hephaestus, the legendary blacksmith who built the first robot, Talos, and AI Pandora on the island of Lemnos, where we are launching one of our labs and future campus. This project, along with others, offers an incredible opportunity to contribute to something meaningful while honing your skills.</p>

<h4>Focus</h4>
<ul>
<li><strong>Design Excellence:</strong> Our UX/UI team will lead the creation of intuitive, impactful digital experiences.</li>
<li><strong>Multimedia Innovation:</strong> We're venturing into podcasting, influencer marketing, and even film production using cutting-edge AI tools like Sora to revolutionize storytelling.</li>
<li><strong>Entrepreneurial Spirit:</strong> Flo Studios embodies the startup culture, focusing on launching innovative projects and empowering creators to bring their ideas to life.</li>
</ul>`
  }
};

async function updateProject(projectTitle, newDescription) {
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
          description: newDescription,
        },
      }),
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update project: ${updateResponse.statusText}`);
    }

    console.log(`✅ Successfully updated "${projectTitle}"`);
  } catch (error) {
    console.error(`❌ Error updating "${projectTitle}":`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting project Focus sections update...\n');
  console.log(`Strapi URL: ${STRAPI_URL}\n`);

  for (const [title, data] of Object.entries(projectUpdates)) {
    await updateProject(title, data.description);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✨ Project updates complete!');
  console.log('\nNext steps:');
  console.log('1. Visit your Vercel site to see the updated projects');
  console.log('2. The changes should appear within 60 seconds due to ISR revalidation');
}

main();
