#!/usr/bin/env node

/**
 * Upload Project Images to Strapi and Link to Projects
 * 
 * This script uploads project images from the frontend/public directory
 * and links them to the correct projects in Strapi.
 * 
 * Usage: export STRAPI_API_TOKEN=<your-token> && node upload-project-images.js
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const { URL } = require('url')
const FormData = require('form-data')

const STRAPI_URL = process.env.STRAPI_URL || 'https://strapi-production-7ecb.up.railway.app'
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN
const PUBLIC_DIR = path.join(__dirname, '../frontend/public')

if (!STRAPI_API_TOKEN) {
  console.error('❌ Error: STRAPI_API_TOKEN environment variable is required')
  console.log('Usage: export STRAPI_API_TOKEN=<your-token> && node upload-project-images.js')
  process.exit(1)
}

// Map project slugs to their image files
const projectImageMap = {
  'moodchanger': 'Frame-3-1.jpg',
  'caipo': 'Frame-2-2.jpg',
  'flo-studios': 'Frame-4.jpg',
  'flo-travel': 'Frame-5-3.jpg',
}

async function getAllProjects() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${STRAPI_URL}/api/projects?pagination[pageSize]=100`)
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data))
        } else {
          reject(new Error(`Failed: ${res.statusCode} - ${data}`))
        }
      })
    })

    req.on('error', reject)
    req.end()
  })
}

async function uploadImage(imagePath, imageName) {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('files', fs.createReadStream(imagePath), imageName)

    const url = new URL(`${STRAPI_URL}/api/upload`)
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const uploadedFiles = JSON.parse(data)
          resolve(uploadedFiles[0])
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} - ${data}`))
        }
      })
    })

    req.on('error', reject)
    form.pipe(req)
  })
}

async function linkImageToProject(projectDocumentId, imageId) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      data: {
        images: [imageId]
      }
    })

    const url = new URL(`${STRAPI_URL}/api/projects/${projectDocumentId}`)
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data))
        } else {
          reject(new Error(`Failed: ${res.statusCode} - ${data}`))
        }
      })
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  console.log('🚀 Starting project image upload...\n')

  // Get all projects
  console.log('📥 Fetching projects from Strapi...')
  const response = await getAllProjects()
  const projects = response.data || []
  console.log(`✅ Found ${projects.length} projects\n`)

  let successCount = 0
  let errorCount = 0

  for (const [slug, imageName] of Object.entries(projectImageMap)) {
    try {
      // Find the project
      const project = projects.find(p => p.slug === slug)
      if (!project) {
        console.log(`⚠️  Project not found: ${slug}`)
        errorCount++
        continue
      }

      // Check if image file exists
      const imagePath = path.join(PUBLIC_DIR, imageName)
      if (!fs.existsSync(imagePath)) {
        console.log(`⚠️  Image file not found: ${imageName}`)
        errorCount++
        continue
      }

      console.log(`📤 Uploading ${imageName} for project: ${project.title}`)
      
      // Upload the image
      const uploadedImage = await uploadImage(imagePath, imageName)
      console.log(`✅ Uploaded: ${imageName} (ID: ${uploadedImage.id})`)

      // Link image to project
      console.log(`🔗 Linking image to project...`)
      await linkImageToProject(project.documentId, uploadedImage.id)
      console.log(`✅ Successfully linked image to ${project.title}\n`)
      
      successCount++
      
      // Wait a bit between uploads
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.log(`❌ Error processing ${slug}:`, error.message)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary:')
  console.log(`   ✅ Successfully uploaded and linked: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log('='.repeat(60))
  console.log('\n✨ Project image upload complete!')
  console.log('\n📝 Next steps:')
  console.log('   1. Visit your Strapi admin: ' + STRAPI_URL + '/admin')
  console.log('   2. Go to Content Manager → Project')
  console.log('   3. Verify images are attached to projects')
  console.log('   4. Check the Projects page on your website')
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
