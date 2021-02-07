interface Task {
    id: number
    description: string
    completed: boolean
    deadline: number
    recurringInterval: number
    assignedGroup: string
    assignedUser: string
  }

interface UserProfile {
  id: number
  username: string
  name: string
  groups: Array<string>
}

interface Identifiable {
  id: number
  name: string
}

export type {
  Task, UserProfile, Identifiable
}