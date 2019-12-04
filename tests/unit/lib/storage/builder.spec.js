import { BuildObject } from 'lib/storage'

describe('lib:storage:BuildObject', () => {

  it('should be BuildObject', () => {
    expect(new BuildObject('test', 'value')).toBeTruthy()
  })
})
