type Interval = "minute" | "hour" | "day" | "week" | "month" | "year"

const Time = {

    addToDate: (date: Date, n: number, interval: Interval): Date => {
      let date0 = new Date(date)
      let checkRollover = () => {
        if (date0.getDate() !== date.getDate()) {
          date0.setDate(0)
        }
      }
      switch(interval) {
        case "year":
          date0.setFullYear(date0.getFullYear() + n)
          checkRollover()
          break
        case "month": 
          date0.setMonth(date0.getMonth() + n)
          checkRollover()
          break
        case "week":
          date0.setDate(date0.getDate() + 7 * n)
          break
        case "day":
          date0.setDate(date0.getDate() + n)
          break
        case "hour":
          date0.setTime(date0.getTime() + n * 3600000)
          break
        case "minute":
          date0.setTime(date0.getTime() + n * 60000)
          break
      }
    return date0
  },

  toUnixTime: (date: Date): number => {
    return Math.floor(date.getTime() / 1000)
  }

}

export type {
  Interval
}

export {
  Time
}