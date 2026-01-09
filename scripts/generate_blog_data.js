const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../posts');
const outputFile = path.join(__dirname, '../assets/blog_data.js');

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

function getMetaContent(content, name) {
    const match = content.match(new RegExp(`<meta name="${name}" content="([^"]*)"`, 'i')) ||
        content.match(new RegExp(`<meta content="([^"]*)" name="${name}"`, 'i'));
    return match ? match[1] : '';
}

function getTitle(content) {
    const match = content.match(/<title>([^<]*)<\/title>/i);
    return match ? match[1] : 'Untitled Post';
}

// Function to extract first image src from content
function getFirstImage(content) {
    const match = content.match(/<img[^>]+src="([^">]+)"/i);
    return match ? match[1] : null;
}

try {
    const files = fs.readdirSync(postsDir);
    const posts = files
        .filter(file => file.endsWith('.html'))
        .map(file => {
            const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
            const stats = fs.statSync(path.join(postsDir, file));

            return {
                filename: file,
                url: `posts/${file}`,
                title: getTitle(content),
                description: getMetaContent(content, 'description') || 'Click to read more...',
                date: stats.birthtime.toISOString().split('T')[0], // Creation date
                tags: ['Trends'], // Default tag for now
                image: getFirstImage(content) || 'assets/images/default-blog.jpg' // Fallback image
            };
        })
        // Sort by date descending (newest first)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Output as a JavaScript file with a global variable
    const jsContent = `window.blogPosts = ${JSON.stringify(posts, null, 2)};`;

    fs.writeFileSync(outputFile, jsContent);
    console.log(`Successfully generated blog index (JS) with ${posts.length} posts.`);
} catch (err) {
    console.error('Error generating blog index:', err);
}
