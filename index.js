const DECIMAL_SEPARATOR = '.'
const MINUS = '-'
const ZERO = '0'

const COMPARE_GREATER = 'G'
const COMPARE_LESS = 'L'
const COMPARE_EQUAL = 'E'

module.exports = sum

function sum(a, b) {
    validate(a)
    validate(b)

    const isAPositive = a[0] !== MINUS
    const isBPositive = b[0] !== MINUS

    a = a.replace(MINUS, '')
    b = b.replace(MINUS, '')

    const normalizationResult = normalize(a, b)
    a = normalizationResult[0]
    b = normalizationResult[1]

    if (isAPositive && isBPositive) {
        return add(a, b)
    } else if (!isAPositive && !isBPositive) {
        return MINUS + add(a, b)
    }

    const comparisonResult = compare(a, b)
    if (comparisonResult === COMPARE_GREATER) {
        return isAPositive ? subtract(a, b) : MINUS + subtract(a, b)
    } else if (comparisonResult === COMPARE_LESS) {
        return isBPositive ? subtract(b, a) : MINUS + subtract(b, a)
    } else {
        return ZERO
    }
}

function validate(number) {
    if (typeof number !== 'string') {
        throw new Error('Arguments must have string type.')
    }

    if (!/^(?:0|-?[1-9]\d*|-?(?:0|[1-9]\d*)\.\d*[1-9])$/.test(number)) {
        throw new Error('Invalid number format.')
    }
 }

function normalize(a, b) {
    const aParts = a.split(DECIMAL_SEPARATOR)
    let aInt = aParts[0]
    let aFrac = aParts[1]

    const bParts = b.split(DECIMAL_SEPARATOR)
    let bInt = bParts[0]
    let bFrac = bParts[1]

    if (aInt.length > bInt.length) {
        bInt = bInt.padStart(aInt.length, ZERO)
    } else if (aInt.length < bInt.length) {
        aInt = aInt.padStart(bInt.length, ZERO)
    }

    if (aFrac === undefined && bFrac === undefined) {
        return getNormalizedNumbers([[aInt, aFrac], [bInt, bFrac]])
    }

    if (aFrac === undefined) {
        aFrac = ZERO
    } else if (bFrac === undefined) {
        bFrac = ZERO
    }

    if (aFrac.length > bFrac.length) {
        bFrac = bFrac.padEnd(aFrac.length, ZERO)
    } else if (aFrac.length < bFrac.length) {
        aFrac = aFrac.padEnd(bFrac.length, ZERO)
    }

    return getNormalizedNumbers([[aInt, aFrac], [bInt, bFrac]])
}

function getNormalizedNumbers(partsList) {
    return partsList.map(parts => parts.filter(part => part !== undefined).join(DECIMAL_SEPARATOR))
}

function compare(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] > b [i]) {
            return COMPARE_GREATER
        } else if (a[i] < b[i]) {
            return COMPARE_LESS
        }
    }

    return COMPARE_EQUAL
}

function add(a, b) {
    let sum = ''
    let rest = 0

    for (let i = a.length - 1; i >= 0; i--) {
        if (a[i] === DECIMAL_SEPARATOR) {
            sum = DECIMAL_SEPARATOR + sum

            continue
        }

        const c = (parseInt(a[i]) + parseInt(b[i]) + rest).toString()
        if (c.length > 1) {
            rest = parseInt(c[0])
            sum = c[1] + sum
        } else {
            rest = 0
            sum = c + sum
        }
    }

    if (rest) {
        sum = rest + sum
    }

    return sum
}

function subtract(a, b) {
    let diff = ''
    let tenBorrowed = false

    for (let i = a.length - 1; i >= 0; i--) {
        if (a[i] === DECIMAL_SEPARATOR) {
            diff = DECIMAL_SEPARATOR + diff

            continue
        }

        let firstNumber = a[i]

        if (tenBorrowed) {
            firstNumber = firstNumber === 0 ? 9 : firstNumber - 1
            tenBorrowed = false
        }

        let c = parseInt(firstNumber) - parseInt(b[i])
        if (c < 0) {
            c = c + 10
            tenBorrowed = true
        }

        diff = c + diff
    }

    return diff.replace(/^0+/, ZERO).replace(/0+$/, '').replace(/\.$/, '')
}
