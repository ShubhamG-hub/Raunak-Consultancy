require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
    console.log('--- Setting up Supabase Storage ---');

    // 1. Check if "images" bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError.message);
        return;
    }

    const bucketExists = buckets.find(b => b.name === 'images');

    if (!bucketExists) {
        console.log('Bucket "images" not found. Creating...');
        const { data, error: createError } = await supabase.storage.createBucket('images', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
            fileSizeLimit: 5242880 // 5MB
        });

        if (createError) {
            console.error('Error creating bucket:', createError.message);
        } else {
            console.log('✅ Bucket "images" created successfully!');
        }
    } else {
        console.log('✅ Bucket "images" already exists.');

        // Ensure it's public
        if (!bucketExists.public) {
            console.log('Updating bucket to be public...');
            const { error: updateError } = await supabase.storage.updateBucket('images', {
                public: true
            });
            if (updateError) console.error('Error making bucket public:', updateError.message);
            else console.log('✅ Bucket updated to public.');
        }
    }

    console.log('\n--- Setup Complete ---');
    console.log('Please ensure you have RLS policies set up in Supabase Dashboard if you want strict security.');
    console.log('For direct admin uploads via service_role key, no policies are required.');
}

setupStorage();
