import { DatePipe } from '@angular/common'
import { dateOperators, intOperators, operators, seenGuideOperators } from './utils'
import { getConditionTime } from './utils'

const UserConditions = {
  USER_FIELD: '1_1',
  SEEN_GUIDE: '2_1',
  ADVANCE_IN_GUIDE: '3_1',
  CLOSED_GUIDE: '3_2',
  ADVANCED_OR_CLOSED_GUIDE: '3_3',
  FINISHED_GUIDE: '3_4',
  SEEN_GUIDE_TIMED: '4_1',
  ADVANCE_IN_GUIDE_TIMED: '4_2',
  FINISHED_GUIDE_TIMED: '4_3',
  CLOSED_GUIDE_TIMED: '4_4',
  FIRST_LOGIN: '5_1',
}

export class GuideConditions {
  allGuides = []
  roles = []
  pages = []
  datePipe: DatePipe

  constructor() {
    this.datePipe = new DatePipe('en-US')
  }

  setValues = (allGuides: any, roles: any, pages: any) => {
    this.allGuides = allGuides
    this.roles = roles
    this.pages = pages
  }

  getGuideConditions = (conditions: any) => {
    const retValue = conditions
      .map((c: any) => {
        let result = ''
        let simple_or_datetime = false
        if (!!c.tags) {
          if (c.tags.includes('panel') || c.tags.includes('autoload')) {
            result = 'Display this Guide in '
          }
          if (c.tags.includes('autoload')) {
            result += 'Autoload'
          }
          if (c.tags.includes('panel') && c.tags.includes('autoload')) {
            result += ' AND '
          }
          if (c.tags.includes('panel')) {
            result += 'Help Panel'
          }
        }
        // formType === 'time'
        // type = 'page' ?
        // subType = 'datetime'
        const datetime = (c.type === 'page' && c.subType === 'datetime') || (c.type === 'datetime' && !c.hasOwnProperty('subType'))
        if (datetime) {
          result += ' starting '
          result += c.startsOn === null || c.startsOn === '' ? 'Now' : this.datePipe.transform(c.startsOn, 'MM/dd/yyyy hh:mm a')
          result += ' and ends '
          result += c.endsOn === null || c.endsOn === '' ? 'Never' : this.datePipe.transform(c.endsOn, 'MM/dd/yyyy hh:mm a')
          if (c.startsOn || c.endsOn) {
            // result += ` (${this.datePipe.transform('', 'localTimeZone')})`
          }
          simple_or_datetime = true
        }
        // formType === 'simple'
        // subType = undefined
        // simple role and advanced userfield are the very same
      const role = typeof c.operand === 'string' && c.operand?.startsWith('[') && c.operand?.endsWith(']')
      const simple_page = (c.type === 'page' && c.subType === 'url' && !c.hasOwnProperty('exact')) ||
        (c.type === 'url' && !c.hasOwnProperty('subType'))
        /*&& !c.hasOwnProperty('exact')*/
        const simple_role = ((c.type === 'user' && c.subType === '1_1') || (c.type === '1_1' && !c.hasOwnProperty('subType'))) && role
        if (simple_page || simple_role) {
          if (!!c.type) {
            result += c.type === 'always' ? ' Always ' : ' When '
            if (c.type !== 'always') {
              result += c.type === 'user' || c.type === '1_1' ? 'Role' : 'Page'
              result += !!c.not ? ' is NOT ' : ' is '
              result += `${ this.getConditionOperand(c) } `
            }
          }
          simple_or_datetime = true
        }
        // formType === 'advanced'
        // if (!simple_page && !simple_role && c.type !== 'always' && c.subType !== 'datetime') {
        if (!simple_or_datetime && c.type !== 'always') {
          result += ' When '
          if (c.type === 'user' || (!c.hasOwnProperty('subType') &&
            ['1_1', '2_1', '3_1', '3_2', '3_3', '3_4', '4_1', '4_2', '4_3', '4_4', '5_1'].includes(c.type))) {
            result += 'User'
            result += c.not ? ' has NOT ' : ' has '
            if (c.subType === '1_1' || (!c.hasOwnProperty('subType') && c.type === '1_1')) {
              if (!!c.userField) {
                result += 'field '
                if (!!c.userField.name) {
                  result += c.userField.name
                  result += ' whose value is '
                  result += this.getSelectedOperand(c)
                  if (!!c.operand) {
                    result += !!c.userField.type && c.userField.type !== 'date' ?
                      c.operand : this.datePipe.transform(c.operand, 'MM/dd/yyyy hh:mm a')
                  }
                }
              }
              // alternate
              if (!!c.field_name) {
                result += 'field '
                result += c.field_name
                result += ' whose value is '
                result += c.operator.name === 'Equals' ? '' : c.operator.name
                result += ' '
                result += c.operand
              }
            } else if (c.subType === '2_1' || (!c.hasOwnProperty('subType') && c.type === '2_1')) {
              result += 'seen guide'
              if (!!c.scenario || !!c.scenario_apiname) {
                result += ` ${ this.getSelectedScenario(c) } `
              }
              if (!!c.operator) {
                result += this.getSelectedOperand(c)
              }
              if (!!c.count) {
                result += ` ${ c.count } times `
              }
            } else if (c.subType === '3_1' || (!c.hasOwnProperty('subType') && c.type === '3_1')) {
              result += 'advanced in guide'
              if (!!c.scenario || !!c.scenario_apiname) {
                result += ` ${ this.getSelectedScenario(c) } `
              }
            } else if (c.subType === '3_2' || (!c.hasOwnProperty('subType') && c.type === '3_2')) {
              result += 'closed guide'
              if (!!c.scenario || !!c.scenario_apiname) {
                result += ` ${ this.getSelectedScenario(c) } `
              }
            } else if (c.subType === '3_3' || (!c.hasOwnProperty('subType') && c.type === '3_3')) {
              result += 'advanced in or closed guide'
              if (!!c.scenario || !!c.scenario_apiname) {
                result += ` ${ this.getSelectedScenario(c) } `
              }
            } else if (c.subType === '3_4' || (!c.hasOwnProperty('subType') && c.type === '3_4')) {
              result += 'finished guide'
              if (!!c.scenario || !!c.scenario_apiname) {
                result += ` ${ this.getSelectedScenario(c) } `
              }
            } else if ((c.subType === '4_1' || (!c.hasOwnProperty('subType') && c.type === '4_1'))
              || (c.subType === '4_2' || (!c.hasOwnProperty('subType') && c.type === '4_2'))
              || (c.subType === '4_3' || (!c.hasOwnProperty('subType') && c.type === '4_3'))
              || (c.subType === '4_4' || (!c.hasOwnProperty('subType') && c.type === '4_4'))) {
              if (c.subType === '4_1' || (!c.hasOwnProperty('subType') && c.type === '4_1')) {
                result += 'seen guide (timed)'
              } else if (c.subType === '4_2' || (!c.hasOwnProperty('subType') && c.type === '4_2')) {
                result += 'advanced in guide (timed)'
              } else if (c.subType === '4_3' || (!c.hasOwnProperty('subType') && c.type === '4_3')) {
                result += 'finished guide (timed)'
              } else if (c.subType === '4_4' || (!c.hasOwnProperty('subType') && c.type === '4_4')) {
                result += 'closed guide (timed)'
              }
              if (!!c.scenario || !!c.scenario_apiname) {
                result += ` ${ this.getSelectedScenario(c) } `
                result += 'more than '
              }
              if (!!c.seconds) {
                result += `${ getConditionTime(c.seconds) } ago `
              }
            } else if (c.subType === '5_1' || (!c.hasOwnProperty('subType') && c.type === '5_1')) {
              result += 'first login '
              if (!!c.operator) {
                result += this.getSelectedOperand(c)
              }
              if (!!c.seconds) {
                result += `${ getConditionTime(c.seconds) } ago `
              }
            }
          } else if (c.type === 'page' || (!c.hasOwnProperty('subType') &&
            ['url', 'param', 'variable', 'sessionVar', 'cookie', 'found', 'visible'].includes(c.type))) {
            result += 'Page'
            result += c.not ? ' has NOT ' : ' has '
            if ((c.subType === 'url' && c.type === 'page' && c.hasOwnProperty('exact')) ||
              (!c.hasOwnProperty('subType') && c.type === 'url')) {
              result += 'URL matching'
              if (!!c.url) {
                result += ` ${ c.url } `
              }
              if (!!c.exact) {
                result += 'exactly '
              }
            } else if (c.subType === 'param' || (!c.hasOwnProperty('subType') && c.type === 'param')) {
              result += 'URL parameter'
              if (!!c.variable) {
                result += ` ${ c.variable } `
              }
              if (!!c.operator) {
                result += `${ c.operator }`
              }
              if (!!c.val) {
                result += ` ${ c.val } `
              }
            } else if (c.subType === 'variable' || (!c.hasOwnProperty('subType') && c.type === 'variable')) {
              result += ' variable '
              if (!!c.variable) {
                result += ` ${ c.variable } `
              }
              if (!!c.operator) {
                result += `${ c.operator }`
              }
              if (!!c.val) {
                result += ` ${ c.val } `
              }
            } else if (c.subType === 'sessionVar' || (!c.hasOwnProperty('subType') && c.type === 'sessionVar')) {
              result += 'session variable'
              if (!!c.variable) {
                result += ` ${ c.variable } `
              }
              // alternate
              if (!!c.varName) {
                result += ` ${ c.varName } `
              }
              // alternate
              if (!c.operator) {
                c.operator = "equals"
              }
              if (!!c.operator) {
                result += `${ c.operator }`
              }
              if (!!c.val) {
                result += ` ${ c.val } `
              }
            } else if (c.subType === 'cookie' || (!c.hasOwnProperty('subType') && c.type === 'cookie')) {
              result += 'cookie'
              if (!!c.variable) {
                result += ` ${ c.variable } `
              }
              if (!!c.operator) {
                result += `${ c.operator }`
              }
              if (!!c.val) {
                result += ` ${ c.val } `
              }
            } else if (c.subType === 'found' || (!c.hasOwnProperty('subType') && c.type === 'found')) {
              result += 'element'
              if (!!c.selector) {
                result += ` ${ c.selector } `
              }
              if (!!c.multi) {
                result += '(expect multiple elements) '
              }
            } else if (c.subType === 'visible' || (!c.hasOwnProperty('subType') && c.type === 'visible')) {
              result += 'visible element'
              if (!!c.selector) {
                result += ` ${ c.selector } `
              }
            }
          }
        }

        result += c.comment === 'autoseg' ? '[Auto Generated]' : ''
        result += ' '
        result += !!c.active ? '(Active)' : '(Inactive)'

        return result
      })
      .join('; ')

    return retValue
  }

  getGuideConditionsType = (conditions: any) => {
    const retValue = conditions.map((c: any) => {
      const result = []
      const simple = c.type === 'always' && !c.hasOwnProperty('subType')
      const simple_page = (c.type === 'page' && c.subType === 'url') || (c.type === 'url' && !c.hasOwnProperty('subType'))
      /*&& !c.hasOwnProperty('exact')*/
      const simple_role = (c.type === 'user' && c.subType === '1_1') || (c.type === '1_1' && !c.hasOwnProperty('subType'))
      /*&& c.operand?.startsWith('[') && c.operand?.endsWith(']')*/
      const datetime = (c.type === 'page' && c.subType === 'datetime') || (c.type === 'datetime' && !c.hasOwnProperty('subType'))
      if (datetime) {
        result.push('Time')
      } else if (simple || simple_page || simple_role) {
        result.push('Simple')
      } else if (c.type !== 'always') {
        result.push('Advanced')
      } else {
        result.push('Unknown')
      }

      return result
    })

    return [...new Set(retValue.flat())].sort().join('/')
  }

  getGuideAdvancedConditionsType = (conditions: any) =>
    conditions.map((c: any) => ({ type: c.type, subType: c.subType }))

  getGuideAdvancedConditions = (conditions: any, advancedTypes: any, type: any) => {
    const _conditions = conditions.split(';')
    const result: any[] = []
    advancedTypes.forEach((c: any, i: any) => {
      if (type === 'always' && c.type === type) {
        result.push(_conditions[i])
      } else if (type === 'page' && c.type === type && c.subType !== 'datetime') { // page/datetime
        result.push(_conditions[i])
      } else if (type === 'user' && c.type === type && c.subType !== '1_1') { // user/1_1 = role
        result.push(_conditions[i])
      } else if (type === 'datetime' && c.subType === type) { // page/datetime
        result.push(_conditions[i])
      } else if (type === 'role' && c.type === 'user' && c.subType === '1_1') { // user/1_1 = role
        result.push(_conditions[i])
      }
    })

    return result.join(';')
  }

  getConditionOperand = (c: any) => {
    let result = ''
    const list = c.type === 'user' || c.type === '1_1' ? this.roles : /*c.type === 'page' ?*/ this.pages /*: []*/
    const _op = c.type === 'user' || c.type === '1_1' ? c.operand : c.url
    const op = _op?.replace(/[\[\]]/g, '').split('|').filter((i: any) => !!i)
    if (op) {
      result = op.map((i: any) => (c.type === 'user' || c.type === '1_1' ? (list.find((j:any) => j.value === i) as any)?.name ||
        i : (list.find((j: any) => j.url === i) as any)?.name || i)).join(' OR ')
    }

    return result
  }

  getSelectedOperand = (c: any) => {
    let selectedOperator = ''
    let op
    if (c.subType === '1_1') {
      switch (c.type) {
        case 'int':
          //find the selected int operator display name
          op = intOperators.find(i => i.type === c.type)
          if (!!op) {
            selectedOperator = op.displayName ?? ''
          }
          break
        case 'date':
          //find the selected date operator display name
          op = dateOperators.find(i => i.type === c.type)
          if (!!op) {
            selectedOperator = op.guideName ?? ''
          }
          break
        case '':
        case 'string':
        default:
          //find the selected string operator display name
          op = operators.find(i => i.type === c.type)
          if (!!op) {
            selectedOperator = op.displayName ?? ''
          }
          break
      }
    } else if (['2_1', '5_1'].includes(c.subType) || ['2_1'].includes(c.type)) {
      op = seenGuideOperators.find(i => i.type === c.operator)
      if (!!op) {
        selectedOperator = op.displayName ?? ''
      }
    }

    return selectedOperator
  }

  getSelectedScenario = (c: any) => {
    let result = ''
    const guide: any = this.allGuides.find((i: any) => (c.scenario && i.id === c.scenario) || (c.scenario_apiname && i.apiName === c.scenario_apiname))
    if (guide) {
      result = guide.guideName || guide.displayName // displayName in Content Management
    }

    return result
  }
}
