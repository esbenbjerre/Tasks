import React, {Component} from "react"
import {UserProfile, Identifiable} from "./Models"
import {Time} from "./Time"

type Props = {
    profile: UserProfile
    users: Array<Identifiable>
    groups: Array<Identifiable>
    onSuccess: (message: string) => void
    onError: (error: string) => void
    getTasks: () => void
  }
  
type State = {
  description: string,
  deadline: string,
  recurringInterval: string,
  assignedGroup: string
  assignedUser: string
}

const deadlineOptions = ["5 minutes", "10 minutes", "30 minutes", "1 hour", "1 day", "1 week", "1 month", "1 year"]
const recurringIntervalOptions = ["hourly", "daily", "weekly", "monthly", "yearly"]

const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default class AddTask extends Component<Props, State> {

    constructor(props: Props) {
      super(props)
      this.state = {
        description: "",
        deadline: "",
        recurringInterval: "",
        assignedGroup: "",
        assignedUser: ""
      }
      this.handleChange = this.handleChange.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>): void {
      this.setState({
        ...this.state,
        [event.currentTarget.name]: event.currentTarget.value
      })
     }

    handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
      event.preventDefault()
      
      if (this.state.description === "") {
        return this.props.onError("Description must be non-empty")
      }

      let now = new Date()
      let deadline = 0
      switch (this.state.deadline) {
        case "5 minutes":
          deadline = Time.toUnixTime(Time.addToDate(now, 5, "minute"))
          break
        case "10 minutes":
          deadline = Time.toUnixTime(Time.addToDate(now, 10, "minute"))
          break
        case "30 minutes":
          deadline = Time.toUnixTime(Time.addToDate(now, 30, "minute"))
          break
        case "1 hour":
          deadline = Time.toUnixTime(Time.addToDate(now, 1, "hour"))
          break
        case "1 day":
          deadline = Time.toUnixTime(Time.addToDate(now, 1, "day"))
          break
        case "1 week":
          deadline = Time.toUnixTime(Time.addToDate(now, 1, "week"))
          break
        case "1 month":
          deadline = Time.toUnixTime(Time.addToDate(now, 1, "month"))
          break
        case "1 year":
          deadline = Time.toUnixTime(Time.addToDate(now, 1, "year"))
          break
      }
      let body = JSON.stringify({
        description: this.state.description,
        deadline: deadline,
        recurringInterval: Number(this.state.recurringInterval),
        assignedGroup: this.state.assignedGroup === "" ? null : Number(this.state.assignedGroup),
        assignedUser: Number(this.state.assignedUser)
      })
      console.log(body)
      let apiKey = localStorage.getItem("apiKey")
      if (apiKey !== null && apiKey !== "") {
        fetch("https://localhost:5001/api/tasks/create",
        {method: "POST", headers: {"X-API-Key": apiKey}, body: body})
        .then(response => response.json().then(data => ({response: response, body: data})))
        .then((data) => {
          if (!data.response.ok) {
            return this.props.onError(data.body.message)
          }
          this.props.getTasks()
          return this.props.onSuccess(data.body.message)
          },
          (_) => {
            this.props.onError("Network error")
          }
        )
      }

    }

    render() {
      return (
          <div className="Box-row f5">
          <form onSubmit={this.handleSubmit}>

            <div className="form-group">
              <div className="form-group-header">
                <label htmlFor="description">Task</label>
              </div>
              <div className="form-group-body">
                <input className="form-control width-full" type="text" id="description" name="description" onChange={this.handleChange}/>
              </div>
            </div>

            <div className="form-actions">
            <button className="btn btn-outline" type="submit">Add</button>

            <details>
              <summary className="btn-link">Options</summary>
              <div>

                <div className="form-group">
                  <div className="form-group-header">
                    <label htmlFor="deadline">Deadline</label>
                  </div>
                  <div className="form-group-body">
                    <select className="form-select select-sm" id="deadline" name="deadline" onChange={this.handleChange}>
                      <option></option>
                      {deadlineOptions.map(deadline => {
                        return (
                          <option key={deadline} value={deadline}>{capitalize(deadline)}</option>
                        )
                      })}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-group-header">
                    <label htmlFor="recurringInterval">Recurring</label>
                  </div>
                  <div className="form-group-body">
                    <select className="form-select select-sm" id="recurringInterval" name="recurringInterval" onChange={this.handleChange}>
                      <option></option>
                      {recurringIntervalOptions.map((interval, i) => {
                        return (
                          <option key={interval} value={i}>{capitalize(interval)}</option>
                        )
                      })}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-group-header">
                    <label htmlFor="assignedGroup">Assigned team</label>
                  </div>
                  <div className="form-group-body">
                    <select className="form-select select-sm" id="assignedGroup" name="assignedGroup" onChange={this.handleChange}>
                      <option></option>
                      {this.props.groups.map(group => {
                        return (
                          <option key={group.id} value={group.id}>{group.name}</option>
                        )
                      })}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-group-header">
                    <label htmlFor="assignedUser">Assigned person</label>
                  </div>
                  <div className="form-group-body">
                    <select className="form-select select-sm" id="assignedUser" name="assignedUser" onChange={this.handleChange}>
                      <option></option>
                      {this.props.users.map(user => {
                        return (
                          <option key={user.id} value={user.id} selected={user.id === this.props.profile.id}>{user.name}</option>
                        )
                      })}
                    </select>
                  </div>
                </div>

              </div>
            </details>

            </div>

          </form>
        </div>
      )
    }

}