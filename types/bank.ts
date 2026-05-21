export type Letter = 'A' | 'B' | 'C' | 'D'

export interface OptionMap { A: string; B: string; C: string; D: string }

export interface Mcq {
  id: string
  no: number
  stem: string
  options: OptionMap
  answer: Letter
  explain: string
  chapterId?: string
}

export interface Kp { title: string; points: string[] }

export interface Chapter {
  id: string
  no: number
  title: string
  mcq: Mcq[]
  kps: Kp[]
}

export interface BankMeta {
  source: string
  subject: string
  totalChapters: number
  totalMcq: number
  totalKp: number
}

export interface Bank {
  meta: BankMeta
  chapters: Chapter[]
}

export interface ChapterSummary {
  id: string
  no: number
  title: string
  mcqCount: number
  kpCount: number
}

export interface BankMetaExt extends BankMeta {
  chapters: ChapterSummary[]
}

export interface AnswerRecord {
  ts: number
  picked: Letter
  correct: boolean
}
