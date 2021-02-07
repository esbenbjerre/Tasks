import React, {Component} from "react"
import {UserProfile, Task, Identifiable} from "./Models"
import AddTask from "./AddTask"

type Props = {
  handleSignOut: () => void
}

type State = {
  profile: UserProfile
  tasks: Array<Task>
  users: Array<Identifiable>
  groups: Array<Identifiable>
  error: string
  message: string
}

export default class Tasks extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      profile: {
        id: -1,
        username: "",
        name: "",
        groups: []
      },
      tasks: [],
      users: [],
      groups: [],
      error: "",
      message: ""
    }
    this.showError = this.showError.bind(this)
    this.showMessage = this.showMessage.bind(this)
    this.getTasks = this.getTasks.bind(this)
  }

  componentDidMount(): void {
    this.getProfile()
    this.getTasks()
    this.getUsers()
    this.getGroups()
  }

  getProfile(): void {
    let apiKey = localStorage.getItem("apiKey")
    if (apiKey !== null && apiKey !== "") {
      fetch("https://localhost:5001/api/profile", {headers: {"X-API-Key": apiKey}})
      .then(response => response.json())
      .then(data => {
        console.log(JSON.stringify(data as UserProfile))
        this.setState({profile: data as UserProfile})})
    }
  }

  getUsers(): void {
    let apiKey = localStorage.getItem("apiKey")
    if (apiKey !== null && apiKey !== "") {
      fetch("https://localhost:5001/api/users", {headers: {"X-API-Key": apiKey}})
      .then(response => response.json())
      .then(data => this.setState({users: data as Array<Identifiable>}))
    }
  }

  getGroups(): void {
    let apiKey = localStorage.getItem("apiKey")
    if (apiKey !== null && apiKey !== "") {
      fetch("https://localhost:5001/api/groups", {headers: {"X-API-Key": apiKey}})
      .then(response => response.json())
      .then(data => this.setState({groups: data as Array<Identifiable>}))
    }
  }

  getTasks(): void {
    let apiKey = localStorage.getItem("apiKey")
    if (apiKey !== null && apiKey !== "") {
      fetch("https://localhost:5001/api/tasks", {headers: {"X-API-Key": apiKey}})
      .then(response => response.json())
      .then(data => this.setState({tasks: data as Array<Task>}))
    }
  }

  showError(error: string): void {
    this.setState({error: error})
  }

  showMessage(message: string): void {
    this.setState({message: message})
  }

  deleteTask(id: number): void {
    let apiKey = localStorage.getItem("apiKey")
    if (apiKey !== null && apiKey !== "") {
      fetch(`https://localhost:5001/api/tasks/delete/${id}`, {method: "POST", headers: {"X-API-Key": apiKey}})
      .then(response =>  response.json().then(data => ({response: response, body: data})))
    .then((data) => {
        if (!data.response.ok) {
          return this.showError(data.body.message)
        }
        this.getTasks()
        return this.showMessage(data.body.message)
      },
      (_) => {
        this.showError("Network error")
      }
    )
    }
  }

  completeTask(id: number): void {
    let apiKey = localStorage.getItem("apiKey")
    if (apiKey !== null && apiKey !== "") {
      fetch(`https://localhost:5001/api/tasks/complete/${id}`, {method: "POST", headers: {"X-API-Key": apiKey}})
      .then(response =>  response.json().then(data => ({response: response, body: data})))
    .then((data) => {
        if (!data.response.ok) {
          return this.showError(data.body.message)
        }
        this.getTasks()
        return this.showMessage(data.body.message)
      },
      (_) => {
        this.showError("Network error")
      }
    )
    }
  }

  formatDateTime(date: Date): string {
    let addZeroIfNeeded = (s: string) => s.padStart(2, "0")
    let day = addZeroIfNeeded(`${date.getDate()}`)
    let month = addZeroIfNeeded(`${date.getMonth() + 1}`)
    let year = addZeroIfNeeded(`${date.getFullYear()}`)
    let hours = addZeroIfNeeded(`${date.getHours()}`)
    let minutes = addZeroIfNeeded(`${date.getMinutes()}`)
    return `${day}/${month} ${year} ${hours}:${minutes}`
  }

  renderTaskLabels(timestamp: number, recurring: boolean): JSX.Element {
    let dateInPast = new Date(timestamp * 1000) <= new Date()
    let recurringLabel = recurring && <span className="IssueLabel bg-blue text-white">Recurring</span>
    let overdueLabel = dateInPast && <span className="IssueLabel bg-red text-white">Overdue</span>
    return (
      <span>
        {recurringLabel} {overdueLabel}
       </span>
    )
  }

  renderTasks(tasks: Array<Task>): JSX.Element[] {
    return (
      tasks.map((task) => {

        let renderCompleteButton = () => {
          if (task.assignedUser === "you") {
            return (
            <button className="btn btn-primary" type="button" onClick={() => this.completeTask(task.id)}>
               <svg className="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg>
             </button>
            )
          }
          return (
          <button className="btn btn-disabled" type="button" disabled>
            <svg className="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg>
          </button>
        )
        }

        let renderDeleteButton = () => {
          if (task.assignedUser === "you") {
            return (
              <div>
                <button className="btn-octicon btn-octicon-danger" type="button" onClick={() => this.deleteTask(task.id)}>
                  <svg className="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fillRule="evenodd" d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z"></path></svg>
                </button>
              </div>
            )
          }
        }

        return (
         <div className="Box-row d-flex flex-items-center flex-justify-between" key={task.id}>

           <div className="mr-3">
             {renderCompleteButton()}
           </div>

           <div className="flex-1">
             <strong>{task.description}</strong>
             <div className="text-small text-gray-light">
               {task.deadline > 0 && <>{this.formatDateTime(new Date(task.deadline * 1000))}<br/></>}
             Assigned to {task.assignedUser}
             </div>
             {task.deadline > 0 && this.renderTaskLabels(task.deadline, task.recurringInterval > 0)}
           </div>

           {renderDeleteButton()}

         </div>
        )
     })
    )
  }

  render() {
    return (
      <div className="col-6 mx-auto mt-3">

        {this.state.error !== "" && 
          <div className="form-group">
            <div className="form-group-body">
              <div className="flash flash-error">
                {this.state.error}
                <button className="flash-close js-flash-close" type="button" onClick={() => this.setState({error: ""})}>
                <svg className="octicon octicon-x" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M3.72 3.72C3.86062 3.57955 4.05125 3.50066 4.25 3.50066C4.44875 3.50066 4.63937 3.57955 4.78 3.72L8 6.94L11.22 3.72C11.2887 3.64631 11.3715 3.58721 11.4635 3.54622C11.5555 3.50523 11.6548 3.48319 11.7555 3.48141C11.8562 3.47963 11.9562 3.49816 12.0496 3.53588C12.143 3.5736 12.2278 3.62974 12.299 3.70096C12.3703 3.77218 12.4264 3.85702 12.4641 3.9504C12.5018 4.04379 12.5204 4.14382 12.5186 4.24452C12.5168 4.34523 12.4948 4.44454 12.4538 4.53654C12.4128 4.62854 12.3537 4.71134 12.28 4.78L9.06 8L12.28 11.22C12.3537 11.2887 12.4128 11.3715 12.4538 11.4635C12.4948 11.5555 12.5168 11.6548 12.5186 11.7555C12.5204 11.8562 12.5018 11.9562 12.4641 12.0496C12.4264 12.143 12.3703 12.2278 12.299 12.299C12.2278 12.3703 12.143 12.4264 12.0496 12.4641C11.9562 12.5018 11.8562 12.5204 11.7555 12.5186C11.6548 12.5168 11.5555 12.4948 11.4635 12.4538C11.3715 12.4128 11.2887 12.3537 11.22 12.28L8 9.06L4.78 12.28C4.63782 12.4125 4.44977 12.4846 4.25547 12.4812C4.06117 12.4777 3.87579 12.399 3.73837 12.2616C3.60096 12.1242 3.52225 11.9388 3.51882 11.7445C3.51539 11.5502 3.58752 11.3622 3.72 11.22L6.94 8L3.72 4.78C3.57955 4.63938 3.50066 4.44875 3.50066 4.25C3.50066 4.05125 3.57955 3.86063 3.72 3.72Z"></path>
                </svg>
              </button>
            </div>
          </div>
          </div>}
        {this.state.message !== "" && 
          <div className="form-group">
            <div className="form-group-body">
              <div className="flash">
                {this.state.message}
                <button className="flash-close js-flash-close" type="button" onClick={() => this.setState({message: ""})}>
                  <svg className="octicon octicon-x" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3.72 3.72C3.86062 3.57955 4.05125 3.50066 4.25 3.50066C4.44875 3.50066 4.63937 3.57955 4.78 3.72L8 6.94L11.22 3.72C11.2887 3.64631 11.3715 3.58721 11.4635 3.54622C11.5555 3.50523 11.6548 3.48319 11.7555 3.48141C11.8562 3.47963 11.9562 3.49816 12.0496 3.53588C12.143 3.5736 12.2278 3.62974 12.299 3.70096C12.3703 3.77218 12.4264 3.85702 12.4641 3.9504C12.5018 4.04379 12.5204 4.14382 12.5186 4.24452C12.5168 4.34523 12.4948 4.44454 12.4538 4.53654C12.4128 4.62854 12.3537 4.71134 12.28 4.78L9.06 8L12.28 11.22C12.3537 11.2887 12.4128 11.3715 12.4538 11.4635C12.4948 11.5555 12.5168 11.6548 12.5186 11.7555C12.5204 11.8562 12.5018 11.9562 12.4641 12.0496C12.4264 12.143 12.3703 12.2278 12.299 12.299C12.2278 12.3703 12.143 12.4264 12.0496 12.4641C11.9562 12.5018 11.8562 12.5204 11.7555 12.5186C11.6548 12.5168 11.5555 12.4948 11.4635 12.4538C11.3715 12.4128 11.2887 12.3537 11.22 12.28L8 9.06L4.78 12.28C4.63782 12.4125 4.44977 12.4846 4.25547 12.4812C4.06117 12.4777 3.87579 12.399 3.73837 12.2616C3.60096 12.1242 3.52225 11.9388 3.51882 11.7445C3.51539 11.5502 3.58752 11.3622 3.72 11.22L6.94 8L3.72 4.78C3.57955 4.63938 3.50066 4.44875 3.50066 4.25C3.50066 4.05125 3.57955 3.86063 3.72 3.72Z"></path>
                  </svg>
                </button>
              </div>
            </div>
        </div>}

        <div className="Box Box--spacious f4">
          <div className="Box-header">
            <h3 className="Box-title">
              Your tasks
            </h3>
          </div>

          <AddTask profile={this.state.profile} users={this.state.users} groups={this.state.groups} onSuccess={this.showMessage} onError={this.showError} getTasks={this.getTasks}/>

          {this.renderTasks(this.state.tasks)}

        </div>

        <div className="mt-3">
            <button className="btn btn-danger" onClick={this.props.handleSignOut}>Sign out</button>
        </div>

      </div>
    )
  }
}