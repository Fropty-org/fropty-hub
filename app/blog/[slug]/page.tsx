import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { ArrowLeft, Rocket } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { allPosts } from "../../lib/blog/posts";
import { RelatedPostCard } from "../../components/blog/RelatedPostCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: { title: post.title, description: post.description },
  };
}

function getPostContent(slug: string): string {
  const filePath = path.join(process.cwd(), "app", "lib", "blog", "content", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}

const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginTop: 40, marginBottom: 12, color: "var(--text)" }} {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: 28, marginBottom: 8, color: "var(--text)" }} {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p style={{ lineHeight: 1.8, marginBottom: 16, color: "var(--text-muted)" }} {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul style={{ paddingLeft: 24, marginBottom: 16 }} {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li style={{ lineHeight: 1.8, marginBottom: 4, color: "var(--text-muted)" }} {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong style={{ color: "var(--text)", fontWeight: 700 }} {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a style={{ color: "var(--primary)", textDecoration: "underline", textUnderlineOffset: 3 }} {...props} />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div style={{ overflowX: "auto", marginBottom: 20 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }} {...props} />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th style={{ textAlign: "left", padding: "10px 14px", borderBottom: "2px solid var(--border)", color: "var(--text-faint)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }} {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }} {...props} />
  ),
  hr: () => <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "32px 0" }} />,
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote style={{ borderLeft: "3px solid var(--primary)", paddingLeft: 20, margin: "20px 0", color: "var(--text-muted)", fontStyle: "italic" }} {...props} />
  ),
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const content = getPostContent(slug);
  if (!content) notFound();

  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      <article style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        {/* Back */}
        <Link
          href="/blog"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "13px", color: "var(--text-faint)", textDecoration: "none", marginBottom: 32 }}
        >
          <ArrowLeft size={14} /> Blog
        </Link>

        {/* Header */}
        <header style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--primary)" }}>
              {post.category}
            </span>
            <span style={{ color: "var(--text-faint)", fontSize: "12px" }}>·</span>
            <span style={{ color: "var(--text-faint)", fontSize: "13px" }}>
              {new Date(post.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span style={{ color: "var(--text-faint)", fontSize: "12px" }}>·</span>
            <span style={{ color: "var(--text-faint)", fontSize: "13px" }}>{post.readTime} min de leitura</span>
          </div>

          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 16 }}>
            {post.title}
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            {post.description}
          </p>
        </header>

        {/* MDX content */}
        <div>
          <MDXRemote source={content} components={mdxComponents} />
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: 48,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "28px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 8 }}>Gostou? Veja como funciona na prática.</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 20 }}>
            Configure seu plano agora e receba um orçamento gratuito em minutos.
          </p>
          <Link
            href="/configurador"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--cta-bg)",
              color: "var(--cta-text)",
              padding: "11px 22px",
              borderRadius: 10,
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            <Rocket size={14} /> Configurar meu app
          </Link>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 80px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Outros artigos</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {related.map((rel) => (
              <RelatedPostCard key={rel.slug} post={rel} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
