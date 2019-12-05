import { BuildObject } from 'lib/storage'

describe('lib:storage:BuildObject', () => {

  it('should be BuildObject', () => {
    expect(new BuildObject('test', 'value')).toBeTruthy()
  })

  it('has key and value', () => {
    expect(new BuildObject('test', 'value')).toEqual({
      test: 'value'
    })
  })
})
