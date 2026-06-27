import type { Metadata } from "next";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { allPosts } from "../lib/blog/posts";
import { PostCard } from "../components/blog/PostCard";
import { Pencil } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artigos sobre desenvolvimento de apps, produto digital e como a Fropty Apps trabalha.",
};

export default function BlogPage() {
  const sorted = [...allPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      <section style={{ padding: "80px 24px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <span className="section-chip" style={{ marginBottom: 24, display: "inline-flex" }}>
            <Pencil size={12} /> Blog
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Conteúdo para quem quer crescer
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.7 }}>
            Dicas práticas sobre apps, produto digital e como a tecnologia pode impulsionar o seu negócio.
          </p>
        </div>
      </section>

      <section style={{ padding: "20px 24px 100px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {sorted.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
