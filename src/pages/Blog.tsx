import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import destJapan from "@/assets/dest-japan.jpg";
import destGreece from "@/assets/dest-greece.jpg";
import destKerala from "@/assets/dest-kerala.jpg";
import destThailand from "@/assets/dest-thailand.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destIceland from "@/assets/dest-iceland.jpg";

const blogPosts = [
  { title: "10 Must-Visit Hidden Gems in Japan", image: destJapan, author: "Sarah Mitchell", date: "Mar 15, 2026", readTime: "5 min read", category: "Guides" },
  { title: "A Complete Guide to Greek Island Hopping", image: destGreece, author: "Mark Rodriguez", date: "Mar 10, 2026", readTime: "8 min read", category: "Guides" },
  { title: "Kerala Backwaters: A Photo Journey", image: destKerala, author: "Priya Sharma", date: "Mar 5, 2026", readTime: "4 min read", category: "Photography" },
  { title: "Best Street Food in Thailand", image: destThailand, author: "Tom Wilson", date: "Feb 28, 2026", readTime: "6 min read", category: "Food" },
  { title: "Dubai on a Budget: Yes, It's Possible!", image: destDubai, author: "Emily Chen", date: "Feb 20, 2026", readTime: "7 min read", category: "Budget" },
  { title: "Iceland's Northern Lights: When & Where", image: destIceland, author: "Alex Johnson", date: "Feb 15, 2026", readTime: "5 min read", category: "Nature" },
];

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-3">Travel Blog</h1>
            <p className="text-muted-foreground text-lg font-body max-w-xl mx-auto">Stories, tips, and guides from our travel experts</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, i) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all cursor-pointer"
              >
                <div className="h-48 overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={640} height={640} />
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{post.category}</span>
                  <h2 className="font-heading font-bold text-lg text-card-foreground mt-3 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Read More <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BlogPage;
