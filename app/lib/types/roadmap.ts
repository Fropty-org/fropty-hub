export type RoadmapStatus = 'ideia' | 'planejado' | 'em_desenvolvimento' | 'lancado' | 'descartado'

export interface RoadmapItem {
  id: string
  title: string
  description?: string
  status: RoadmapStatus
  category: string
  priority_score: number
  votes: number
  visibility: 'publico' | 'privado'
  target_version?: string
  launched_at?: string
  created_at: string
  updated_at: string
  user_voted?: boolean
}
