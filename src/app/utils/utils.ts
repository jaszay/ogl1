export const getConditionTime = (seconds: number = 0) => {
    const { day, hour, minute, second } = convertTimeFromSecs(seconds)
    let time = ' '
    if (!!day) {
      time += `${ day.toString() + (day > 1 ? ' days' : ' day') } `
    }
    if (!!hour) {
      time += `${ hour.toString() + (hour > 1 ? ' hours' : ' hour') } `
    }
    if (!!minute) {
      time += `${ minute.toString() + (minute > 1 ? ' minutes' : ' minute') } `
    }
    if (second) {
      time += `${ second.toString() + (second > 1 ? ' seconds' : ' second') } `
    }
  
    return time
  }
  
  export const convertFromSecs = (total_seconds: number = 0) => {
    let total_hours, total_minutes
    let duration_int: any = {}
  
    total_minutes = Math.floor(total_seconds / 60)
    total_hours = Math.floor(total_minutes / 60)
  
    duration_int['day'] = Math.floor(total_hours / 24)
    duration_int['hour'] = total_hours % 24
    duration_int['minute'] = total_minutes % 60
    duration_int['second'] = total_seconds % 60
  
    return duration_int
  }

  export const convertTimeFromSecs = (seconds = 0) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
  
    return {
      day: Math.floor(hours / 24),
      hour: hours % 24,
      minute: minutes % 60,
      second: seconds % 60
    }
  }

export interface IOperator {
    name: string
    type: string
    displayName?: string
    guideName?: string
  }

export const operators: IOperator[] = [
  {
    name: 'Exists',
    type: 'exists',
    displayName: 'Exists'
  },
  {
    name: '=',
    type: 'EQ',
    displayName: 'Equals'
  }
]

export const seenGuideOperators: IOperator[] = [
  {
    name: 'less than',
    type: 'LT',
    displayName: 'less than'
  },
  {
    name: 'exactly',
    type: 'EQ',
    displayName: 'exactly'
  },
  {
    name: 'more than',
    type: 'GT',
    displayName: 'more than'
  }
]

export const intOperators: IOperator[] = [
  {
    name: 'Exists',
    type: 'exists',
    displayName: 'Exists'
  },
  {
    type: 'LT',
    name: '<',
    displayName: 'Less Than'
  },
  {
    type: 'LTE',
    name: '<=',
    displayName: 'Less Than or Equals'
  },
  {
    type: 'EQ',
    name: '=',
    displayName: 'Equals'
  },
  {
    type: 'GTE',
    name: '>=',
    displayName: 'Greater Than or Equal'
  },
  {
    type: 'GT',
    name: '>',
    displayName: 'Greater Than'
  }
]

export const dateOperators: IOperator[] = [
  {
    name: 'Exists',
    type: 'exists',
    displayName: 'Exists'
  },
  {
    type: 'LT',
    name: 'Before compare-to time',
    displayName: 'Before compare-to time'
  },
  {
    type: 'LTE',
    name: 'At or before compare-to time',
    displayName: 'At or before compare-to time'
  },
  {
    type: 'EQ',
    name: 'At compare-to time',
    displayName: 'At compare-to time'
  },
  {
    type: 'GTE',
    name: 'At or after compare-to time',
    displayName: 'At or after compare-to time'
  },
  {
    type: 'GT',
    name: 'After compare-to time',
    displayName: 'After compare-to time'
  },
  {
    type: 'MTNSBT',
    name: 'More than (before)',
    displayName: 'More than (before)'
  },
  {
    type: 'LTNSBT',
    name: 'Less than (before)',
    displayName: 'Less than (before)'
  },
  {
    type: 'MTNSAT',
    name: 'More than (after)',
    displayName: 'More than (after)'
  },
  {
    type: 'LTNSAT',
    name: 'Less than (after)',
    displayName: 'Less than (after)'
  }
]

export const deepCopy = (arr: any[]) => {
  const copy: any[] = []
  arr.forEach(elem => {
    if (Array.isArray(elem)) {
      copy.push(deepCopy(elem))
    } else {
      if (typeof elem === 'object') {
        copy.push(deepCopyObject(elem))
      } else {
        copy.push(elem)
      }
    }
  })

  return copy
}

export const deepCopyObject = (obj: any) => {
  if (!obj) {
    return obj
  }
  const tempObj: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      tempObj[key] = deepCopy(value)
    } else {
      if (typeof value === 'object') {
        tempObj[key] = deepCopyObject(value)
      } else {
        tempObj[key] = value
      }
    }
  }

  return tempObj
}  