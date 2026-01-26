import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ArticleData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  featured_image_alt: string;
  category_id: string;
  status: 'published';
  is_featured: boolean;
  is_trending: boolean;
  published_at: Timestamp;
  reading_time: number;
  view_count: number;
  author_id: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Sample articles data for each category
const sampleArticles: Record<string, Omit<ArticleData, 'category_id' | 'published_at' | 'created_at' | 'updated_at'>[]> = {
  health: [
    {
      title: "10 Essential Health Tips for a Better Lifestyle",
      slug: "10-essential-health-tips-better-lifestyle",
      excerpt: "Discover simple yet effective health tips that can transform your daily routine and improve your overall well-being.",
      content: `<p>Maintaining good health doesn't have to be complicated. Here are 10 essential tips that can make a significant difference in your life:</p>
        <h2>1. Stay Hydrated</h2>
        <p>Drinking enough water is crucial for your body's functions. Aim for at least 8 glasses a day.</p>
        <h2>2. Regular Exercise</h2>
        <p>Even 30 minutes of moderate exercise daily can boost your energy and improve cardiovascular health.</p>
        <h2>3. Balanced Diet</h2>
        <p>Include plenty of fruits, vegetables, whole grains, and lean proteins in your meals.</p>
        <h2>4. Quality Sleep</h2>
        <p>Getting 7-9 hours of quality sleep helps your body repair and recharge.</p>
        <h2>5. Stress Management</h2>
        <p>Practice meditation, deep breathing, or yoga to manage daily stress effectively.</p>
        <h2>6. Regular Check-ups</h2>
        <p>Preventive healthcare can catch issues early and keep you healthy longer.</p>
        <h2>7. Limit Processed Foods</h2>
        <p>Reduce intake of processed and sugary foods for better nutrition.</p>
        <h2>8. Stay Social</h2>
        <p>Maintaining social connections is vital for mental health and longevity.</p>
        <h2>9. Practice Mindfulness</h2>
        <p>Being present in the moment can reduce anxiety and improve mental clarity.</p>
        <h2>10. Avoid Harmful Habits</h2>
        <p>Limit alcohol consumption and avoid smoking for optimal health.</p>
        <p>Remember, small consistent changes lead to significant improvements over time. Start with one or two tips and gradually incorporate more into your routine.</p>`,
      featured_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop",
      featured_image_alt: "Healthy lifestyle tips",
      status: 'published',
      is_featured: false,
      is_trending: true,
      reading_time: 5,
      view_count: 0,
      author_id: null,
    },
    {
      title: "Understanding Mental Health: A Comprehensive Guide",
      slug: "understanding-mental-health-comprehensive-guide",
      excerpt: "Learn about mental health awareness, common conditions, and practical ways to maintain emotional well-being.",
      content: `<p>Mental health is just as important as physical health, yet it's often overlooked. This comprehensive guide will help you understand the basics of mental wellness.</p>
        <h2>What is Mental Health?</h2>
        <p>Mental health refers to our emotional, psychological, and social well-being. It affects how we think, feel, and act in daily life.</p>
        <h2>Common Mental Health Conditions</h2>
        <p>Anxiety disorders, depression, and stress-related conditions are among the most common mental health challenges people face today.</p>
        <h2>Signs to Watch For</h2>
        <p>Changes in sleep patterns, mood swings, withdrawal from activities, and difficulty concentrating can be indicators of mental health concerns.</p>
        <h2>Ways to Maintain Mental Health</h2>
        <ul>
          <li>Regular exercise and physical activity</li>
          <li>Healthy eating habits</li>
          <li>Adequate sleep</li>
          <li>Social connections</li>
          <li>Stress management techniques</li>
          <li>Professional support when needed</li>
        </ul>
        <p>Remember, seeking help is a sign of strength, not weakness. If you're struggling, don't hesitate to reach out to mental health professionals.</p>`,
      featured_image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=800&fit=crop",
      featured_image_alt: "Mental health awareness",
      status: 'published',
      is_featured: false,
      is_trending: false,
      reading_time: 6,
      view_count: 0,
      author_id: null,
    },
    {
      title: "The Benefits of Regular Exercise for Longevity",
      slug: "benefits-regular-exercise-longevity",
      excerpt: "Discover how consistent physical activity can add years to your life and improve your quality of life.",
      content: `<p>Regular exercise is one of the most powerful tools for extending your lifespan and enhancing your quality of life.</p>
        <h2>Cardiovascular Benefits</h2>
        <p>Exercise strengthens your heart, improves circulation, and reduces the risk of heart disease and stroke.</p>
        <h2>Weight Management</h2>
        <p>Physical activity helps maintain a healthy weight, reducing the risk of obesity-related conditions.</p>
        <h2>Mental Health Boost</h2>
        <p>Exercise releases endorphins, natural mood elevators that can reduce symptoms of depression and anxiety.</p>
        <h2>Bone and Muscle Strength</h2>
        <p>Weight-bearing exercises help maintain bone density and muscle mass as you age.</p>
        <h2>Better Sleep</h2>
        <p>Regular physical activity can improve sleep quality and help you fall asleep faster.</p>
        <h2>Getting Started</h2>
        <p>Start with 30 minutes of moderate activity most days of the week. Walking, swimming, cycling, or dancing are all excellent options.</p>
        <p>Remember, any movement is better than none. Find activities you enjoy, and you'll be more likely to stick with them long-term.</p>`,
      featured_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop",
      featured_image_alt: "Exercise and longevity",
      status: 'published',
      is_featured: true,
      is_trending: false,
      reading_time: 4,
      view_count: 0,
      author_id: null,
    },
  ],
  technology: [
    {
      title: "The Future of Artificial Intelligence: Trends to Watch in 2025",
      slug: "future-artificial-intelligence-trends-2025",
      excerpt: "Explore the latest AI developments and how they're reshaping industries from healthcare to finance.",
      content: `<p>Artificial Intelligence continues to evolve at an unprecedented pace, transforming how we work, live, and interact with technology.</p>
        <h2>Generative AI Revolution</h2>
        <p>Advanced language models and image generators are becoming more sophisticated, enabling creative applications across industries.</p>
        <h2>AI in Healthcare</h2>
        <p>Machine learning algorithms are helping doctors diagnose diseases earlier and develop personalized treatment plans.</p>
        <h2>Autonomous Systems</h2>
        <p>Self-driving cars and autonomous robots are moving from research labs to real-world applications.</p>
        <h2>AI Ethics and Regulation</h2>
        <p>As AI becomes more powerful, discussions about ethics, bias, and regulation are becoming increasingly important.</p>
        <h2>Edge AI</h2>
        <p>Running AI models on devices rather than in the cloud is enabling faster, more private applications.</p>
        <p>The future of AI holds incredible promise, but it also requires careful consideration of its implications for society.</p>`,
      featured_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
      featured_image_alt: "Artificial Intelligence future",
      status: 'published',
      is_featured: true,
      is_trending: true,
      reading_time: 7,
      view_count: 0,
      author_id: null,
    },
    {
      title: "Cloud Computing: Transforming Business Operations",
      slug: "cloud-computing-transforming-business-operations",
      excerpt: "Learn how cloud technology is revolutionizing the way businesses operate and scale.",
      content: `<p>Cloud computing has become the backbone of modern business operations, offering flexibility, scalability, and cost-effectiveness.</p>
        <h2>What is Cloud Computing?</h2>
        <p>Cloud computing delivers computing services over the internet, including servers, storage, databases, and software.</p>
        <h2>Key Benefits</h2>
        <ul>
          <li>Cost reduction through pay-as-you-go models</li>
          <li>Scalability to handle growing demands</li>
          <li>Accessibility from anywhere with internet</li>
          <li>Automatic updates and maintenance</li>
          <li>Enhanced security and backup solutions</li>
        </ul>
        <h2>Popular Cloud Services</h2>
        <p>Major providers like AWS, Google Cloud, and Microsoft Azure offer comprehensive cloud solutions for businesses of all sizes.</p>
        <h2>Migration Strategies</h2>
        <p>Moving to the cloud requires careful planning, including assessment of current infrastructure and choosing the right migration approach.</p>
        <p>Cloud computing is no longer optional—it's essential for businesses looking to stay competitive in today's digital landscape.</p>`,
      featured_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop",
      featured_image_alt: "Cloud computing technology",
      status: 'published',
      is_featured: false,
      is_trending: true,
      reading_time: 5,
      view_count: 0,
      author_id: null,
    },
    {
      title: "Cybersecurity Best Practices for 2025",
      slug: "cybersecurity-best-practices-2025",
      excerpt: "Essential cybersecurity strategies to protect your digital assets and personal information.",
      content: `<p>As cyber threats become more sophisticated, implementing strong cybersecurity practices is crucial for individuals and businesses alike.</p>
        <h2>Strong Password Management</h2>
        <p>Use unique, complex passwords for each account and consider using a password manager for better security.</p>
        <h2>Multi-Factor Authentication</h2>
        <p>Enable two-factor authentication wherever possible to add an extra layer of security to your accounts.</p>
        <h2>Regular Software Updates</h2>
        <p>Keep all software, operating systems, and applications updated to patch security vulnerabilities.</p>
        <h2>Phishing Awareness</h2>
        <p>Be cautious of suspicious emails and links. Verify the sender before clicking on any attachments or links.</p>
        <h2>Secure Networks</h2>
        <p>Use encrypted Wi-Fi networks and avoid public Wi-Fi for sensitive transactions.</p>
        <h2>Data Backup</h2>
        <p>Regularly backup important data to secure, off-site locations to protect against ransomware and data loss.</p>
        <p>Cybersecurity is an ongoing process, not a one-time setup. Stay informed about the latest threats and best practices.</p>`,
      featured_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop",
      featured_image_alt: "Cybersecurity protection",
      status: 'published',
      is_featured: false,
      is_trending: false,
      reading_time: 6,
      view_count: 0,
      author_id: null,
    },
  ],
  food: [
    {
      title: "10 Healthy Recipes for Busy Weeknights",
      slug: "10-healthy-recipes-busy-weeknights",
      excerpt: "Quick and nutritious meal ideas that can be prepared in 30 minutes or less.",
      content: `<p>Eating healthy doesn't have to be time-consuming. Here are 10 delicious recipes perfect for busy weeknights.</p>
        <h2>1. One-Pan Lemon Herb Chicken</h2>
        <p>A complete meal with chicken, vegetables, and herbs cooked together in one pan for easy cleanup.</p>
        <h2>2. Quinoa Power Bowl</h2>
        <p>Nutritious quinoa topped with roasted vegetables, chickpeas, and a tangy dressing.</p>
        <h2>3. Quick Stir-Fry</h2>
        <p>Fresh vegetables and protein stir-fried with flavorful sauces—ready in minutes.</p>
        <h2>4. Sheet Pan Salmon</h2>
        <p>Salmon fillets with seasonal vegetables, all roasted together on a single sheet pan.</p>
        <h2>5. Pasta Primavera</h2>
        <p>Fresh spring vegetables tossed with whole-grain pasta and a light olive oil sauce.</p>
        <h2>6. Black Bean Tacos</h2>
        <p>Protein-packed black beans with fresh toppings in warm tortillas—perfect for meatless Mondays.</p>
        <h2>7. Mediterranean Wrap</h2>
        <p>Hummus, fresh vegetables, and feta cheese wrapped in a whole-wheat tortilla.</p>
        <h2>8. Quick Curry</h2>
        <p>Fragrant curry with vegetables and your choice of protein, served over rice.</p>
        <h2>9. Grilled Chicken Salad</h2>
        <p>Marinated grilled chicken over a bed of mixed greens with seasonal vegetables.</p>
        <h2>10. Smoothie Bowl</h2>
        <p>Nutritious smoothie bowls topped with fresh fruits, nuts, and seeds for a quick, healthy meal.</p>
        <p>These recipes prove that healthy eating can be both delicious and convenient, even on your busiest days.</p>`,
      featured_image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop",
      featured_image_alt: "Healthy weeknight recipes",
      status: 'published',
      is_featured: false,
      is_trending: true,
      reading_time: 8,
      view_count: 0,
      author_id: null,
    },
    {
      title: "The Mediterranean Diet: A Path to Better Health",
      slug: "mediterranean-diet-path-better-health",
      excerpt: "Discover the health benefits of the Mediterranean diet and how to incorporate it into your lifestyle.",
      content: `<p>The Mediterranean diet, inspired by the traditional eating patterns of countries bordering the Mediterranean Sea, is consistently ranked as one of the healthiest diets.</p>
        <h2>Key Components</h2>
        <ul>
          <li>Abundant fruits and vegetables</li>
          <li>Whole grains and legumes</li>
          <li>Healthy fats like olive oil</li>
          <li>Moderate fish and poultry</li>
          <li>Limited red meat and sweets</li>
          <li>Red wine in moderation (optional)</li>
        </ul>
        <h2>Health Benefits</h2>
        <p>Research shows the Mediterranean diet can reduce the risk of heart disease, stroke, and certain cancers while promoting brain health.</p>
        <h2>Getting Started</h2>
        <p>Begin by incorporating more vegetables, whole grains, and healthy fats into your meals. Replace butter with olive oil and snack on nuts and fruits.</p>
        <h2>Sample Meal Plan</h2>
        <p>Breakfast: Greek yogurt with berries and honey. Lunch: Mediterranean salad with chickpeas. Dinner: Grilled fish with roasted vegetables.</p>
        <p>The Mediterranean diet isn't just about food—it's about enjoying meals with family and friends, staying active, and savoring life.</p>`,
      featured_image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop",
      featured_image_alt: "Mediterranean diet",
      status: 'published',
      is_featured: true,
      is_trending: false,
      reading_time: 6,
      view_count: 0,
      author_id: null,
    },
    {
      title: "Superfoods: Nature's Powerhouses for Optimal Health",
      slug: "superfoods-natures-powerhouses-optimal-health",
      excerpt: "Explore nutrient-dense superfoods that can boost your health and energy levels naturally.",
      content: `<p>Superfoods are nutrient-rich foods considered especially beneficial for health and well-being. Here are some of the most powerful options.</p>
        <h2>Berries</h2>
        <p>Blueberries, strawberries, and acai berries are packed with antioxidants that fight inflammation and support brain health.</p>
        <h2>Leafy Greens</h2>
        <p>Spinach, kale, and Swiss chard provide vitamins, minerals, and fiber essential for optimal health.</p>
        <h2>Nuts and Seeds</h2>
        <p>Almonds, walnuts, chia seeds, and flaxseeds offer healthy fats, protein, and omega-3 fatty acids.</p>
        <h2>Quinoa</h2>
        <p>This ancient grain is a complete protein, containing all nine essential amino acids.</p>
        <h2>Salmon</h2>
        <p>Rich in omega-3 fatty acids, salmon supports heart and brain health.</p>
        <h2>Turmeric</h2>
        <p>This golden spice contains curcumin, a powerful anti-inflammatory compound.</p>
        <h2>Green Tea</h2>
        <p>Packed with antioxidants and compounds that may boost metabolism and brain function.</p>
        <p>Incorporating these superfoods into your diet can provide a natural boost to your health and energy levels.</p>`,
      featured_image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop",
      featured_image_alt: "Superfoods for health",
      status: 'published',
      is_featured: false,
      is_trending: false,
      reading_time: 5,
      view_count: 0,
      author_id: null,
    },
  ],
  facts: [
    {
      title: "Amazing Facts About the Human Brain",
      slug: "amazing-facts-human-brain",
      excerpt: "Discover fascinating facts about the most complex organ in the human body.",
      content: `<p>The human brain is one of the most remarkable structures in the known universe. Here are some incredible facts about it.</p>
        <h2>Processing Power</h2>
        <p>The brain contains approximately 86 billion neurons, each connected to thousands of others, creating trillions of connections.</p>
        <h2>Energy Consumption</h2>
        <p>Despite making up only 2% of body weight, the brain uses about 20% of the body's total energy.</p>
        <h2>No Pain Receptors</h2>
        <p>The brain itself has no pain receptors, which is why brain surgery can be performed while patients are awake.</p>
        <h2>Memory Capacity</h2>
        <p>Scientists estimate the brain can store approximately 2.5 petabytes of information—equivalent to about 3 million hours of TV shows.</p>
        <h2>Speed of Thought</h2>
        <p>Information travels between neurons at speeds up to 268 miles per hour.</p>
        <h2>Continuous Development</h2>
        <p>The brain continues to develop and change throughout our lives, a process called neuroplasticity.</p>
        <p>These facts highlight just how extraordinary our brains are and why protecting brain health is so important.</p>`,
      featured_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop",
      featured_image_alt: "Human brain facts",
      status: 'published',
      is_featured: false,
      is_trending: true,
      reading_time: 4,
      view_count: 0,
      author_id: null,
    },
    {
      title: "Incredible Facts About Our Planet Earth",
      slug: "incredible-facts-planet-earth",
      excerpt: "Explore mind-blowing facts about the planet we call home.",
      content: `<p>Earth is a fascinating planet with many incredible features and phenomena. Here are some amazing facts about our home.</p>
        <h2>Water Coverage</h2>
        <p>About 71% of Earth's surface is covered by water, but only 2.5% of that is fresh water.</p>
        <h2>The Deepest Point</h2>
        <p>The Mariana Trench in the Pacific Ocean is the deepest point on Earth, reaching depths of over 36,000 feet.</p>
        <h2>Age</h2>
        <p>Earth is approximately 4.5 billion years old, and life has existed on it for about 3.7 billion years.</p>
        <h2>Atmosphere</h2>
        <p>Earth's atmosphere extends about 6,200 miles into space, but most of it is within 10 miles of the surface.</p>
        <h2>Rotation Speed</h2>
        <p>Earth rotates at about 1,000 miles per hour at the equator, but we don't feel it because everything moves together.</p>
        <h2>Biodiversity</h2>
        <p>Scientists estimate there are between 8-10 million species on Earth, but only about 1.2 million have been identified.</p>
        <p>These facts remind us of how unique and precious our planet is, and why we must protect it for future generations.</p>`,
      featured_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop",
      featured_image_alt: "Planet Earth facts",
      status: 'published',
      is_featured: true,
      is_trending: false,
      reading_time: 5,
      view_count: 0,
      author_id: null,
    },
    {
      title: "Fascinating Facts About Space and the Universe",
      slug: "fascinating-facts-space-universe",
      excerpt: "Journey through space with these mind-bending facts about the cosmos.",
      content: `<p>The universe is vast, mysterious, and full of incredible phenomena. Here are some fascinating facts about space.</p>
        <h2>The Observable Universe</h2>
        <p>The observable universe is estimated to be about 93 billion light-years in diameter, containing billions of galaxies.</p>
        <h2>Black Holes</h2>
        <p>Black holes are regions of spacetime where gravity is so strong that nothing, not even light, can escape.</p>
        <h2>The Speed of Light</h2>
        <p>Light travels at approximately 186,282 miles per second—fast enough to circle Earth 7.5 times in one second.</p>
        <h2>Neutron Stars</h2>
        <p>A teaspoon of neutron star material would weigh about 6 billion tons on Earth.</p>
        <h2>Dark Matter</h2>
        <p>Scientists estimate that dark matter makes up about 27% of the universe, though we can't see or detect it directly.</p>
        <h2>Exoplanets</h2>
        <p>As of 2025, astronomers have discovered over 5,000 confirmed exoplanets—planets orbiting stars other than our Sun.</p>
        <p>These facts about space remind us of how vast and mysterious the universe truly is, and how much we still have to discover.</p>`,
      featured_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop",
      featured_image_alt: "Space and universe facts",
      status: 'published',
      is_featured: false,
      is_trending: false,
      reading_time: 6,
      view_count: 0,
      author_id: null,
    },
  ],
  finance: [
    {
      title: "Personal Finance Basics: Building a Strong Financial Foundation",
      slug: "personal-finance-basics-strong-financial-foundation",
      excerpt: "Essential personal finance principles to help you build wealth and achieve financial security.",
      content: `<p>Understanding personal finance is crucial for achieving financial security and building long-term wealth. Here are the fundamentals.</p>
        <h2>Create a Budget</h2>
        <p>Track your income and expenses to understand where your money goes and identify areas for savings.</p>
        <h2>Build an Emergency Fund</h2>
        <p>Aim to save 3-6 months' worth of expenses in an easily accessible account for unexpected situations.</p>
        <h2>Pay Off High-Interest Debt</h2>
        <p>Prioritize paying off credit cards and high-interest loans to free up money for savings and investments.</p>
        <h2>Start Investing Early</h2>
        <p>Thanks to compound interest, starting to invest early can significantly grow your wealth over time.</p>
        <h2>Diversify Your Investments</h2>
        <p>Spread your investments across different asset classes to reduce risk and improve potential returns.</p>
        <h2>Plan for Retirement</h2>
        <p>Contribute to retirement accounts like 401(k)s or IRAs to secure your financial future.</p>
        <h2>Live Below Your Means</h2>
        <p>Spending less than you earn is the foundation of building wealth and achieving financial freedom.</p>
        <p>Remember, financial success is a marathon, not a sprint. Small, consistent actions lead to significant results over time.</p>`,
      featured_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=800&fit=crop",
      featured_image_alt: "Personal finance basics",
      status: 'published',
      is_featured: true,
      is_trending: true,
      reading_time: 7,
      view_count: 0,
      author_id: null,
    },
    {
      title: "Investment Strategies for Beginners: A Complete Guide",
      slug: "investment-strategies-beginners-complete-guide",
      excerpt: "Learn the basics of investing and discover strategies to grow your wealth over time.",
      content: `<p>Investing can seem intimidating, but understanding the basics can help you start building wealth confidently.</p>
        <h2>Start with the Basics</h2>
        <p>Before investing, ensure you have an emergency fund and have paid off high-interest debt.</p>
        <h2>Understand Your Risk Tolerance</h2>
        <p>Assess how much risk you're comfortable taking based on your age, financial goals, and timeline.</p>
        <h2>Dollar-Cost Averaging</h2>
        <p>Invest a fixed amount regularly regardless of market conditions to reduce the impact of volatility.</p>
        <h2>Diversification</h2>
        <p>Spread your investments across stocks, bonds, and other assets to reduce risk.</p>
        <h2>Index Funds</h2>
        <p>Low-cost index funds offer broad market exposure and are ideal for beginners.</p>
        <h2>Long-Term Perspective</h2>
        <p>Investing is about long-term growth. Avoid making emotional decisions based on short-term market fluctuations.</p>
        <h2>Rebalance Regularly</h2>
        <p>Periodically adjust your portfolio to maintain your desired asset allocation.</p>
        <p>Remember, the best time to start investing was yesterday. The second best time is today.</p>`,
      featured_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=800&fit=crop",
      featured_image_alt: "Investment strategies",
      status: 'published',
      is_featured: false,
      is_trending: false,
      reading_time: 6,
      view_count: 0,
      author_id: null,
    },
    {
      title: "Cryptocurrency: Understanding Digital Assets in 2025",
      slug: "cryptocurrency-understanding-digital-assets-2025",
      excerpt: "A comprehensive guide to understanding cryptocurrencies, blockchain technology, and digital assets.",
      content: `<p>Cryptocurrency has evolved from a niche technology to a mainstream financial asset. Here's what you need to know.</p>
        <h2>What is Cryptocurrency?</h2>
        <p>Cryptocurrency is a digital or virtual currency secured by cryptography, making it nearly impossible to counterfeit.</p>
        <h2>Blockchain Technology</h2>
        <p>Most cryptocurrencies operate on blockchain technology—a decentralized ledger that records all transactions.</p>
        <h2>Major Cryptocurrencies</h2>
        <p>Bitcoin, Ethereum, and other major cryptocurrencies each serve different purposes in the digital economy.</p>
        <h2>How to Get Started</h2>
        <p>Research thoroughly, start with small amounts, and use reputable exchanges and wallets.</p>
        <h2>Risks and Considerations</h2>
        <p>Cryptocurrency is highly volatile and speculative. Only invest what you can afford to lose.</p>
        <h2>Regulatory Landscape</h2>
        <p>Regulations are evolving worldwide, affecting how cryptocurrencies can be used and traded.</p>
        <h2>Future Outlook</h2>
        <p>While the future is uncertain, cryptocurrencies and blockchain technology continue to show potential for innovation.</p>
        <p>Whether you're investing or just curious, understanding cryptocurrency is becoming increasingly important in today's digital economy.</p>`,
      featured_image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=800&fit=crop",
      featured_image_alt: "Cryptocurrency digital assets",
      status: 'published',
      is_featured: false,
      is_trending: true,
      view_count: 0,
      author_id: null,
      reading_time: 8,
    },
  ],
};

export async function seedArticles() {
  if (!db) {
    console.error('Firebase is not configured');
    return { success: false, error: 'Firebase is not configured' };
  }

  try {
    // Get all categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categories: Category[] = [];
    
    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.is_active !== false) {
        categories.push({
          id: doc.id,
          name: data.name,
          slug: data.slug,
        });
      }
    });

    if (categories.length === 0) {
      return { success: false, error: 'No categories found. Please create categories first.' };
    }

    const results = {
      success: true,
      categoriesProcessed: 0,
      articlesCreated: 0,
      errors: [] as string[],
    };

    // Add 3 articles for each category
    for (const category of categories) {
      const articlesForCategory = sampleArticles[category.slug.toLowerCase()] || [];
      
      // If no sample articles for this category, create generic ones
      if (articlesForCategory.length === 0) {
        for (let i = 1; i <= 3; i++) {
          const articleData: ArticleData = {
            title: `${category.name} Article ${i}`,
            slug: `${category.slug}-article-${i}`,
            excerpt: `This is a sample article about ${category.name.toLowerCase()} topics.`,
            content: `<p>This is sample content for ${category.name} article ${i}. You can edit this content in the admin panel.</p>`,
            featured_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
            featured_image_alt: `${category.name} article ${i}`,
            category_id: category.id,
            status: 'published',
            is_featured: i === 1,
            is_trending: i === 2,
            reading_time: 5,
            view_count: 0,
            author_id: null,
            published_at: Timestamp.now(),
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
          };

          try {
            const docRef = await addDoc(collection(db, 'articles'), articleData);
            console.log(`Created article: ${articleData.title} with ID: ${docRef.id}`);
            results.articlesCreated++;
          } catch (error: any) {
            console.error(`Error creating article for ${category.name}:`, error);
            results.errors.push(`Error creating article for ${category.name}: ${error.message}`);
          }
        }
      } else {
        // Use predefined sample articles
        for (const articleTemplate of articlesForCategory) {
          const articleData: ArticleData = {
            ...articleTemplate,
            category_id: category.id,
            published_at: Timestamp.now(),
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
          };

          try {
            const docRef = await addDoc(collection(db, 'articles'), articleData);
            console.log(`Created article: ${articleTemplate.title} with ID: ${docRef.id}`);
            results.articlesCreated++;
          } catch (error: any) {
            console.error(`Error creating article "${articleTemplate.title}":`, error);
            results.errors.push(`Error creating article "${articleTemplate.title}": ${error.message}`);
          }
        }
      }

      results.categoriesProcessed++;
    }

    return results;
  } catch (error: any) {
    console.error('Error seeding articles:', error);
    return { success: false, error: error.message };
  }
}
