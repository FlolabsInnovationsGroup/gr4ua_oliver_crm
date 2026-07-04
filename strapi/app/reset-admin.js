// Simple script to check and list Strapi admin users
const { Client } = require('pg');

async function listAdminUsers() {
  // Connect to database
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  await client.connect();
  
  try {
    // List all admin users
    const result = await client.query(
      'SELECT id, firstname, lastname, email, username, is_active, created_at FROM admin_users'
    );
    
    console.log(`Found ${result.rowCount} admin user(s):`);
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

listAdminUsers().catch(console.error);
