const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../posts');
const templatePath = path.join(__dirname, '../template.html');

try {
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const files = fs.readdirSync(postsDir);

    files.forEach(file => {
        if (!file.endsWith('.html')) return;

        const filePath = path.join(postsDir, file);
        let postContent = fs.readFileSync(filePath, 'utf-8');

        // Check if file is already templated (contains Tailwind/Template markers)
        if (postContent.includes('bg-tesla-dark') || postContent.includes('@phosphor-icons')) {
            console.log(`Skipping ${file} - already themed.`);
            return;
        }

        // Extract Title
        const titleMatch = postContent.match(/<title>(.*?)<\/title>/s) || postContent.match(/<h1>(.*?)<\/h1>/s);
        let title = titleMatch ? titleMatch[1] : 'Untitled Post';

        // Extract Content (try to get body content or div.content)
        let bodyContent = '';

        // Strategy: prefer div.content, else inner body, else entire file
        const contentDivMatch = postContent.match(/<div class="content">(.*?)<\/div>/s);
        const bodyMatch = postContent.match(/<body>(.*?)<\/body>/s);

        if (contentDivMatch) {
            bodyContent = contentDivMatch[1];
        } else if (bodyMatch) {
            // Remove h1 from body if we already have it for the title header
            bodyContent = bodyMatch[1].replace(/<h1>.*?<\/h1>/s, '');
        } else {
            bodyContent = postContent;
        }

        // Clean up some common clutter if present
        bodyContent = bodyContent.replace(/<a href="index.html">Back to Home<\/a>/, '');

        // Inject into template
        let newContent = templateContent
            .replace(/{{title}}/g, title)
            .replace(/{{content}}/g, bodyContent);

        // Update relative paths in template (since template is in root, but posts are in /posts)
        // Adjust assets/ links to ../assets/
        newContent = newContent.replace(/href="assets\//g, 'href="../assets/');
        newContent = newContent.replace(/src="assets\//g, 'src="../assets/');

        // Adjust navigation links
        newContent = newContent.replace(/href="index.html"/g, 'href="../index.html"');
        newContent = newContent.replace(/href="blog.html"/g, 'href="../blog.html"');
        newContent = newContent.replace(/href="#"/g, 'href="../blog.html"'); // breadcrumbs

        fs.writeFileSync(filePath, newContent);
        console.log(`Themed applied to: ${file}`);
    });

    console.log('All posts updated.');

} catch (err) {
    console.error('Error applying theme:', err);
}
