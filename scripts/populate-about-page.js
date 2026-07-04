#!/usr/bin/env node

/**
 * Populate About Page Content in Strapi
 * 
 * This script creates the editable content sections for the About page.
 * Run with: export STRAPI_API_TOKEN=<your-token> && node populate-about-page.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'https://strapi-production-7ecb.up.railway.app'
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

if (!STRAPI_API_TOKEN) {
  console.error('❌ Error: STRAPI_API_TOKEN environment variable is required')
  console.log('Usage: export STRAPI_API_TOKEN=<your-token> && node populate-about-page.js')
  process.exit(1)
}

// About page content sections
const aboutPageSections = [
  {
    identifier: 'about-title',
    title: 'Flo Labs R&D',
    content: 'Flo Labs R&D',
    subtitle: null
  },
  {
    identifier: 'about-subtitle',
    title: 'EXECUTIVE MANAGEMENT PROGRAM',
    content: 'EXECUTIVE MANAGEMENT PROGRAM',
    subtitle: null
  },
  {
    identifier: 'about-description',
    title: 'About Description',
    content: 'Provides students a <strong>remote</strong>, <strong>unique</strong>, <strong>powerful</strong>, and <strong>immersive</strong> hands on educational experience.',
    subtitle: null
  },
  {
    identifier: 'about-objectives-title',
    title: 'Objectives',
    content: 'Objectives',
    subtitle: null
  },
  {
    identifier: 'about-objectives-content',
    title: 'Objectives Content',
    content: '<p><strong>Experiential Learning:</strong> Unique and immersive educational training with hands-on, real world experience.</p><p>Provide practical experience working on innovative marketable projects.</p>',
    subtitle: null
  },
  {
    identifier: 'about-mission-title',
    title: 'Mission',
    content: 'Mission',
    subtitle: null
  },
  {
    identifier: 'about-mission-content',
    title: 'Mission Content',
    content: '<p>Inspire and empower individuals through transformative educational experiences that foster global perspectives, innovative thinking, and practical skills.</p><p>We aim to cultivate a culture of curiosity and creativity, create jobs of the future, and build innovative solutions for a rapidly changing world.</p>',
    subtitle: null
  },
  {
    identifier: 'about-team-intro',
    title: 'Team Introduction',
    content: '<p>Our team consists of passionate innovators, researchers, and industry experts dedicated to advancing AI and robotics technologies. Together, we\'re building the future through cutting-edge research, experiential learning, and collaborative innovation.</p>',
    subtitle: null
  }
]

async function createSectionContent(section) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/section-contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      },
      body: JSON.stringify({
        data: section
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(JSON.stringify(error))
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw error
  }
}

async function main() {
  console.log('🚀 Starting About page content population...\n')

  let successCount = 0
  let errorCount = 0

  for (const section of aboutPageSections) {
    try {
      console.log(`Creating section: ${section.identifier}...`)
      await createSectionContent(section)
      console.log(`✅ Successfully created: ${section.identifier}`)
      successCount++
    } catch (error) {
      console.log(`⚠️  Error creating ${section.identifier}:`, error.message)
      // Check if it's a duplicate error
      if (error.message.includes('already exists') || error.message.includes('unique')) {
        console.log(`   ℹ️  Section already exists, skipping...`)
      }
      errorCount++
    }
    console.log('')
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')
  console.log(`   ✅ Successfully created: ${successCount}`)
  console.log(`   ⚠️  Errors/Skipped: ${errorCount}`)
  console.log('='.repeat(50))
  console.log('\n✨ About page content population complete!')
  console.log('\n📝 Next steps:')
  console.log('   1. Visit your Strapi admin: ' + STRAPI_URL + '/admin')
  console.log('   2. Go to Content Manager → Section Content')
  console.log('   3. Edit the About page sections as needed')
  console.log('   4. Changes will appear on the website within 60 seconds')
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
