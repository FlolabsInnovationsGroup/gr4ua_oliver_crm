#!/usr/bin/env node

/**
 * Script to set public permissions for all content types in Strapi
 * This allows the frontend to fetch data during build without authentication
 */

const STRAPI_URL = process.env.STRAPI_URL || 'https://strapi-production-7ecb.up.railway.app'
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

if (!STRAPI_API_TOKEN) {
  console.error('❌ STRAPI_API_TOKEN environment variable is required')
  process.exit(1)
}

// Content types that need public read access
const contentTypes = [
  'benefit',
  'blog-post',
  'intern',
  'internship',
  'methodology-item',
  'project',
  'section-content',
  'vertical'
]

// Single types that need public read access
const singleTypes = [
  'site-setting'
]

async function setPublicPermissions() {
  console.log('🔧 Setting public permissions for Strapi content types...\n')

  try {
    // Get the public role
    const rolesResponse = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!rolesResponse.ok) {
      throw new Error(`Failed to fetch roles: ${rolesResponse.status} ${rolesResponse.statusText}`)
    }

    const rolesData = await rolesResponse.json()
    const publicRole = rolesData.roles.find(role => role.type === 'public')

    if (!publicRole) {
      throw new Error('Public role not found')
    }

    console.log(`✓ Found public role (ID: ${publicRole.id})`)

    // Set permissions for each content type
    const permissions = {}

    // Collection types
    for (const contentType of contentTypes) {
      permissions[`api::${contentType}.${contentType}`] = {
        controllers: {
          [contentType]: {
            find: { enabled: true },
            findOne: { enabled: true }
          }
        }
      }
    }

    // Single types
    for (const singleType of singleTypes) {
      permissions[`api::${singleType}.${singleType}`] = {
        controllers: {
          [singleType]: {
            find: { enabled: true }
          }
        }
      }
    }

    // Update the public role with new permissions
    const updateResponse = await fetch(`${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        permissions
      })
    })

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      throw new Error(`Failed to update permissions: ${updateResponse.status} ${updateResponse.statusText}\n${errorText}`)
    }

    console.log('\n✅ Successfully set public permissions for all content types!')
    console.log('\nPublic read access enabled for:')
    console.log('  Collection types:', contentTypes.join(', '))
    console.log('  Single types:', singleTypes.join(', '))

  } catch (error) {
    console.error('\n❌ Error setting permissions:', error.message)
    process.exit(1)
  }
}

setPublicPermissions()
