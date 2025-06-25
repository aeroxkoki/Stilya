// Simple duplicate check script
console.log('[DEBUG] Starting duplicate check...');

const fetch = require('node-fetch');

// Read environment variables directly
const supabaseUrl = 'https://sxbqgrfwffzgqzstnhjh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4YnFncmZ3ZmZ6Z3F6c3RuaGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3NzkzMDIsImV4cCI6MjA0NjM1NTMwMn0.p5D8dqg8UPyHCy8fjBNvqDJJyRh5aed5T8J7PQahL-o';

async function checkDuplicates() {
  try {
    console.log('[DEBUG] Fetching products...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/external_products?is_active=eq.true&select=id,title,price,brand,image_url&order=title`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!response.ok) {
      console.error('[DEBUG] Failed to fetch:', response.statusText);
      return;
    }
    
    const products = await response.json();
    console.log(`[DEBUG] Total products: ${products.length}`);
    
    // Group by title
    const titleGroups = {};
    products.forEach(product => {
      const key = product.title.toLowerCase().trim();
      if (!titleGroups[key]) {
        titleGroups[key] = [];
      }
      titleGroups[key].push(product);
    });
    
    // Find duplicates
    const duplicates = Object.entries(titleGroups)
      .filter(([title, products]) => products.length > 1);
    
    console.log(`[DEBUG] Duplicate titles: ${duplicates.length}`);
    
    // Show first 5 duplicates
    console.log('\n[DEBUG] First 5 duplicates:');
    duplicates.slice(0, 5).forEach(([title, products]) => {
      console.log(`\n"${products[0].title}" - ${products.length} duplicates:`);
      products.forEach((p, i) => {
        console.log(`  ${i+1}. ID: ${p.id}, Price: ${p.price || 'null'}, Brand: ${p.brand || 'null'}`);
      });
    });
    
  } catch (error) {
    console.error('[DEBUG] Error:', error.message);
  }
}

checkDuplicates();
