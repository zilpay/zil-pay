describe('randomBytes', () => {
  it('должен генерировать Uint8Array заданной длины', () => {
    const result = randomBytes(16);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(16);
  });

  it('должен возвращать разные значения при разных вызовах', () => {
    const result1 = randomBytes(16);
    const result2 = randomBytes(16);
    expect(result1).not.toEqual(result2);
  });
});
