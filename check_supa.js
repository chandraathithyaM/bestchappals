const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://izpmatqydhbbrfiegoea.supabase.co',
  'sb_publishable_4NM8Ol7bG6kLNmnZf2PyvA_ZPPU6ffr'
);

async function check() {
  console.log("Fetching categories...");
  const { data: cats, error: err1 } = await supabase.from('categories').select('name, slug, image');
  console.log("Categories:", cats, err1);
  
  console.log("Fetching products...");
  const { data: prods, error: err2 } = await supabase.from('products').select('category, id, name, images').limit(10);
  console.log("Products:", prods, err2);
  
  // get unique product categories
  const { data: allProds } = await supabase.from('products').select('category');
  const uniqueCats = [...new Set(allProds.map(p => p.category))];
  console.log("Unique product categories:", uniqueCats);
}

check();
