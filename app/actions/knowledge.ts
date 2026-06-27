"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { requireRole } from "@/app/lib/auth/require-role";
import type { KnowledgeArticle, ArticleCategory } from "@/app/lib/types/knowledge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export async function getArticles(category?: string, search?: string): Promise<KnowledgeArticle[]> {
  const supabase = (await createClient()) as AnyClient;

  let query = supabase
    .from("knowledge_articles")
    .select("*")
    .eq("published", true)
    .order("views", { ascending: false });

  if (category && category !== "todos") {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[knowledge/getArticles]", error.message);
    return [];
  }

  return (data ?? []) as KnowledgeArticle[];
}

export async function getArticle(slug: string): Promise<KnowledgeArticle | null> {
  const supabase = (await createClient()) as AnyClient;

  const { data, error } = await supabase
    .from("knowledge_articles")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;

  // Incrementa views via RPC (security definer)
  await supabase.rpc("increment_article_views", { article_id: data.id });

  return data as KnowledgeArticle;
}

export async function getRelatedArticles(category: string, excludeSlug: string): Promise<KnowledgeArticle[]> {
  const supabase = (await createClient()) as AnyClient;

  const { data } = await supabase
    .from("knowledge_articles")
    .select("id, title, slug, excerpt, category, views, helpful_yes, helpful_no, published, tags, product, content, author_id, created_at, updated_at, helpful_no")
    .eq("published", true)
    .eq("category", category)
    .neq("slug", excludeSlug)
    .order("views", { ascending: false })
    .limit(5);

  return (data ?? []) as KnowledgeArticle[];
}

export async function getAllArticlesAdmin(): Promise<KnowledgeArticle[]> {
  await requireRole("admin");
  const supabase = (await createClient()) as AnyClient;

  const { data, error } = await supabase
    .from("knowledge_articles")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[knowledge/getAllArticlesAdmin]", error.message);
    return [];
  }

  return (data ?? []) as KnowledgeArticle[];
}

export async function getArticleById(id: string): Promise<KnowledgeArticle | null> {
  await requireRole("admin");
  const supabase = (await createClient()) as AnyClient;

  const { data, error } = await supabase
    .from("knowledge_articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as KnowledgeArticle;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createArticle(formData: FormData): Promise<{ error?: string; id?: string }> {
  const authorId = await requireRole("admin");
  const supabase = (await createClient()) as AnyClient;

  const title     = (formData.get("title")     as string)?.trim().slice(0, 300);
  const slugRaw   = (formData.get("slug")      as string)?.trim();
  const excerpt   = (formData.get("excerpt")   as string)?.trim().slice(0, 500) || null;
  const content   = (formData.get("content")   as string)?.trim();
  const category  = (formData.get("category")  as string)?.trim() as ArticleCategory;
  const product   = (formData.get("product")   as string)?.trim() || null;
  const published = formData.get("published") === "true";

  if (!title || !content || !category) return { error: "Título, conteúdo e categoria são obrigatórios." };

  const slug = slugRaw ? slugify(slugRaw) : slugify(title);

  const { data, error } = await supabase
    .from("knowledge_articles")
    .insert({ title, slug, excerpt, content, category, product, published, author_id: authorId })
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("unique")) return { error: "Já existe um artigo com este slug. Escolha outro título." };
    console.error("[knowledge/createArticle]", error.message);
    return { error: "Erro ao criar artigo." };
  }

  revalidatePath("/admin/base-conhecimento");
  revalidatePath("/portal/base-conhecimento");
  return { id: data.id };
}

export async function updateArticle(id: string, formData: FormData): Promise<{ error?: string }> {
  await requireRole("admin");
  const supabase = (await createClient()) as AnyClient;

  const title    = (formData.get("title")    as string)?.trim().slice(0, 300);
  const slugRaw  = (formData.get("slug")     as string)?.trim();
  const excerpt  = (formData.get("excerpt")  as string)?.trim().slice(0, 500) || null;
  const content  = (formData.get("content")  as string)?.trim();
  const category = (formData.get("category") as string)?.trim() as ArticleCategory;
  const product  = (formData.get("product")  as string)?.trim() || null;
  const published = formData.get("published") === "true";

  if (!title || !content || !category) return { error: "Título, conteúdo e categoria são obrigatórios." };

  const slug = slugRaw ? slugify(slugRaw) : slugify(title);

  const { error } = await supabase
    .from("knowledge_articles")
    .update({ title, slug, excerpt, content, category, product, published })
    .eq("id", id);

  if (error) {
    if (error.message.includes("unique")) return { error: "Já existe um artigo com este slug. Escolha outro." };
    console.error("[knowledge/updateArticle]", error.message);
    return { error: "Erro ao atualizar artigo." };
  }

  revalidatePath("/admin/base-conhecimento");
  revalidatePath("/portal/base-conhecimento");
  revalidatePath(`/portal/base-conhecimento/${slug}`);
  return {};
}

export async function togglePublished(id: string): Promise<{ error?: string }> {
  await requireRole("admin");
  const supabase = (await createClient()) as AnyClient;

  const { data: current } = await supabase
    .from("knowledge_articles")
    .select("published, slug")
    .eq("id", id)
    .single();

  if (!current) return { error: "Artigo não encontrado." };

  const { error } = await supabase
    .from("knowledge_articles")
    .update({ published: !current.published })
    .eq("id", id);

  if (error) return { error: "Erro ao atualizar status." };

  revalidatePath("/admin/base-conhecimento");
  revalidatePath("/portal/base-conhecimento");
  return {};
}

export async function rateArticle(id: string, helpful: boolean): Promise<{ error?: string }> {
  const supabase = (await createClient()) as AnyClient;

  const { error } = await supabase.rpc("rate_article", { article_id: id, helpful });

  if (error) {
    console.error("[knowledge/rateArticle]", error.message);
    return { error: "Erro ao registrar avaliação." };
  }

  return {};
}
