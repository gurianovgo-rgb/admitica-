// Types for the legacy global modules shared with the live static site.
// Source of truth stays in ../data/programs.js and ../src/roadmapData.js —
// the new app imports them as side-effect scripts and reads the globals.

export interface University {
  id: string
  name: string
  program: string
  degree: string
  country: string
  flag: string
  city: string
  field: string
  language: string
  tuition: string
  tuitionMax: number
  deadline: string
  deadlineDays: number
  scholarship: boolean
  ielts: string
  gpa: string
  desc: string
  initial: string
  color: string
  site?: string
}

export interface Grant {
  id: string
  name: string
  org: string
  country: string
  flag: string
  funding: string
  amount: string
  field: string
  deadline: string
  deadlineDays: number
  eligibility: string
  desc: string
  color: string
  initial: string
  degree: string
}

export interface Internship {
  id: string
  name: string
  role: string
  industry: string
  country: string
  flag: string
  city: string
  format: string
  duration: string
  stipend: string
  deadline: string
  deadlineDays: number
  requirements: string
  desc: string
  color: string
  initial: string
}

export type AnyProgram = University | Grant | Internship

export interface RoadmapStage {
  id: string
  name: string
  date: string
  desc: string
  details: string
  checklist: string[]
}

export interface RoadmapEntry {
  id: string
  itemId: string
  step: number
  checks?: Record<string, boolean[]>
}

declare global {
  interface Window {
    AdmiticaData: {
      universities: University[]
      grants: Grant[]
      internships: Internship[]
    }
    buildRoadmapStages: (u: University) => RoadmapStage[]
    ROADMAP_STAGE_COUNT: number
  }
}
