const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

const sampleBlogs = [
    {
        title: "Mastering Financial Planning in 2026",
        slug: "mastering-financial-planning-2026",
        excerpt: "Discover the essential strategies for wealth creation and management in the evolving financial landscape of 2026.",
        content: "Financial planning is more than just saving money; it's about making your money work for you. In 2026, with shifting market dynamics and new investment avenues, having a robust plan is crucial. This guide covers the fundamentals of asset allocation, risk management, and long-term goal setting to help you achieve financial independence.",
        image_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800",
        category: "Finance",
        published: true
    },
    {
        title: "Top 5 Investment Mistakes to Avoid",
        slug: "top-5-investment-mistakes-to-avoid",
        excerpt: "Learn from common pitfalls that many investors face and how to safeguard your portfolio from unnecessary risks.",
        content: "Investing can be rewarding, but it's also filled with traps. From emotional decision-making to lack of diversification, certain mistakes can significantly impact your returns. We take a deep dive into the top 5 mistakes investors make and provide actionable advice on how to avoid them for a more stable and growing portfolio.",
        image_url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800",
        category: "Investment",
        published: true
    },
    {
        title: "Understanding Insurance: A Beginner's Guide",
        slug: "understanding-insurance-guide",
        excerpt: "Protecting what matters most starts with understanding your coverage options. Here's a simple guide to get you started.",
        content: "Insurance is your safety net against the unexpected. Whether it's health, life, or property insurance, knowing the nuances of your policy can save you from financial distress. This article simplifies complex insurance terms and helps you decide which coverage is essential for your life stage.",
        image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800",
        category: "Insurance",
        published: true
    }
];

async function seedBlogs() {
    try {
        console.log('Seeding samples blogs...');

        for (const blog of sampleBlogs) {
            const blogId = uuidv4();
            await db.query(
                'INSERT INTO blogs (id, title, slug, excerpt, content, image_url, category, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [blogId, blog.title, blog.slug, blog.excerpt, blog.content, blog.image_url, blog.category, blog.published]
            );
            console.log(`Seeded: ${blog.title}`);
        }

        console.log('Successfully seeded all blogs!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed blogs:', error);
        process.exit(1);
    }
}

seedBlogs();
