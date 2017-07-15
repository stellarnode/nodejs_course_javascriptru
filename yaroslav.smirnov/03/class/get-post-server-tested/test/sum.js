function sum (a, b) {
  return a + b;
}

describe('sum', () => {
  it('should sum 2 numbers', () => {
    assert.equal(sum(1, 2), 3);
  });
});
