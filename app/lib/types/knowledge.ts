export type ArticleCategory = 'geral' | 'suporte' | 'produto' | 'financeiro' | 'projetos' | 'seguranca' | 'integracao'

export interface KnowledgeArticle {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  category: ArticleCategory
  product?: string
  tags: string[]
  published: boolean
  views: number
  helpful_yes: number
  helpful_no: number
  author_id?: string
  created_at: string
  updated_at: string
}
