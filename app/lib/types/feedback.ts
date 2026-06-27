export type FeedbackType   = 'sugestao' | 'bug' | 'elogio' | 'critica' | 'outro'
export type FeedbackStatus = 'recebido' | 'em_analise' | 'aprovado' | 'descartado' | 'implementado'
export type FeedbackImpact = 'alto' | 'medio' | 'baixo'

export interface Feedback {
  id: string
  client_id: string
  title: string
  description: string
  type: FeedbackType
  product?: string
  status: FeedbackStatus
  impact?: FeedbackImpact
  admin_response?: string
  responded_at?: string
  created_at: string
  updated_at: string
  // joined on admin queries
  client_name?: string
}
