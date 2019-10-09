export interface StringPattern {
  type: 'string',
  value: string
}

export interface RegexpPattern {
  type: 'regexp',
  value: string
}

export interface KeyStringPattern extends StringPattern {
  key: string
}

export interface KeyRegexpPattern extends RegexpPattern {
  key: string
}
