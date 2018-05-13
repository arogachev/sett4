const assert = require('assert')
const withData = require('leche').withData

const sum = require('../index')

describe('sum', () => {
    describe('with invalid numbers', () => {
        describe('with wrong type', () => {
            withData({
                'a having a wrong type': [674, '381'],
                'b having a wrong type': ['674', 381],
                'a and b having a wrong type': [674, 381],
            }, (a, b) => {
                it('should throw an according error', () => {
                    assert.throws(() => {sum(a, b)}, (err) => {
                        return err.message === 'Arguments must have string type.'
                    })
                })
            })
        })

        describe('with wrong format', () => {
            withData({
                'integer, non-digit characters in a': ['1e', '2'],
                'integer, non-digit characters in b': ['1', '2e'],
                'integer, spaces': ['100 000', '200000'],
                'integer, redundant zeroes at the left': ['0001', '2'],
                'float, no integer part': ['.1', '0.2'],
                'float, no fractional part': ['1.', '2.3'],
                'float, wrong decimal delimeter': ['1,2', '2,3'],
                'float, redundant zeroes at the left': ['01.2', '22.3'],
                'float, redundant zeroes at the right': ['1.200', '2.3'],
                'float, redundant fractional part': ['1.000', '2.3'],
            }, (a, b) => {
                it('should throw an according error', () => {
                    assert.throws(() => {sum(a, b)}, (err) => {return err.message === 'Invalid number format.'})
                })
            })
        })
    })

    describe('with positive numbers', () => {
        describe('with 2 positive integer numbers', () => {
            withData({
                'the same length of digits': ['674', '381', '1055'],
                'different length of digits': ['6748', '381', '7129'],
                'reverse order': ['381', '6748', '7129'],
                '1 zero': ['674', '0', '674'],
                '2 zeroes': ['0', '0', '0'],
                'zero at the end of the sum': ['11', '29', '40'],
            }, (a, b, expectedSum) => {
                it('should normalize integer parts, perform addition and keep zeroes', () => {
                    assert.equal(sum(a, b), expectedSum)
                })
            })
        })

        describe('with 2 positive float numbers', () => {
            withData({
                'the same length of digits in fractional part': ['22.2', '17.7', '39.9'],
                'different length of digits in fractional part': ['22.25', '17.7', '39.95'],
                'different length of digits in integer and fractional parts': ['2.25', '17.7', '19.95'],
                'zero in integer part': ['0.2', '0.7', '0.9'],
                'redundant fractional part in sum': ['22.25', '17.75', '40'],
                'redundant zeroes in fractional part in sum': ['22.25', '17.65', '39.9'],
            }, (a, b, expectedSum) => {
                it('should normalize integer and fractional parts, perform addition and trim redundant zeroes', () => {
                    assert.equal(sum(a, b), expectedSum)
                })
            })
        })
    })

    describe('with negative numbers', () => {
        describe('with 2 negative numbers', () => {
            withData({
                'integers': ['-674', '-381', '-1055'],
                'floats': ['-2.25', '-17.7', '-19.95'],
            }, (a, b, expectedSum) => {
                it('should perform addition of absolute values and add minus', () => {
                    assert.equal(sum(a, b), expectedSum)
                })
            })
        })

        describe('with 1 positive number and 1 negative number', () => {
            describe('with |a| > |b|', () => {
                withData({
                    'integers, a > 0, b < 0': ['674', '-381', '293'],
                    'integers, a < 0, b > 0': ['-674', '381', '-293'],
                    'floats, a > 0, b < 0': ['17.7', '-2.25', '15.45'],
                    'floats, a < 0, b > 0': ['-17.7', '2.25', '-15.45'],
                    'integers, borrowing tens': ['4312', '-901', '3411'],
                    'integers, a contains zeroes': ['1009', '-423', '586'],
                }, (a, b, expectedSum) => {
                    it('should subtract |b| from |a|, add minus when a < 0 and trim redundant zeroes', () => {
                        assert.equal(sum(a, b), expectedSum)
                    })
                })
            })

            describe('with |a| < |b|', () => {
                withData({
                    'integers, a > 0, b < 0': ['381', '-674', '-293'],
                    'integers, a < 0, b > 0': ['-381', '674', '293'],
                    'floats, a > 0, b < 0': ['2.25', '-17.7', '-15.45'],
                    'floats, a < 0, b > 0': ['-2.25', '17.7', '15.45'],
                }, (a, b, expectedSum) => {
                    it('should subtract |a| from |b|, add minus when b < 0 and trim redundant zeroes', () => {
                        assert.equal(sum(a, b), expectedSum)
                    })
                })
            })
            
            describe('with |a| = |b|', () => {
                withData({
                    'integers, a > 0, b < 0': ['381', '-381', '0'],
                    'integers, a < 0, b > 0': ['-381', '381', '0'],
                    'floats, a > 0, b < 0': ['2.25', '-2.25', '0'],
                    'floats, a < 0, b > 0': ['-2.25', '2.25', '0'],
                }, (a, b, expectedSum) => {
                    it('should return zero', () => {
                        assert.equal(sum(a, b), expectedSum)
                    })
                })
            })
        })
    })

    describe('with big numbers', () => {
        withData({
            'integers, 20 digits (> Number.MAX_SAFE_INTEGER)': [
                '11111111111111111111',
                '22222222222222222222',
                '33333333333333333333',
            ],
            'floats, 10000 digits in integer part, 10000 digits in fractional part': [
                `${'1'.repeat(10000)}.${'2'.repeat(10000)}`,
                `${'2'.repeat(10000)}.${'3'.repeat(10000)}`,
                `${'3'.repeat(10000)}.${'5'.repeat(10000)}`,
            ]
        }, (a, b, expectedSum) => {
            it('should work the same way as with small numbers', () => {
                assert.equal(sum(a, b), expectedSum)
            })
        })
    })
})
