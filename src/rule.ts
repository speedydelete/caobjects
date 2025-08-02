
export type Neighborhood = 'moore' | 'vonNeumann';

export interface OTRule {
    type: 'ot';
    b: number[];
    s: number[];
    c: number;
    n: Neighborhood;
    r: number;
}

export interface INTRule {
    type: 'int';
    b: Uint8Array;
    s: Uint8Array;
    c: number;
    n: Neighborhood;
    r: number;
}

export type Rule = OTRule | INTRule;


type TransitionGrid = [[number, number, number], [number, number, number], [number, number, number]];

const TRANSITIONS: {[key: number]: {[key: string]: TransitionGrid}} = {
    0: {
        '': [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    },
    1: {
        'c': [[1, 0, 0], [0, 0, 0], [0, 0, 0]],
        'e': [[0, 1, 0], [0, 0, 0], [0, 0, 0]],
    },
    2: {
        'c': [[1, 0, 1], [0, 0, 0], [0, 0, 0]],
        'e': [[0, 1, 0], [1, 0, 0], [0, 0, 0]],
        'k': [[0, 1, 0], [0, 0, 0], [0, 0, 1]],
        'a': [[1, 1, 0], [0, 0, 0], [0, 0, 0]],
        'i': [[0, 1, 0], [0, 0, 0], [0, 1, 0]],
        'n': [[1, 0, 0], [0, 0, 0], [0, 0, 1]],
    },
    3: {
        'c': [[1, 0, 1], [0, 0, 0], [0, 0, 1]],
        'e': [[0, 1, 0], [1, 0, 1], [0, 0, 0]],
        'k': [[0, 1, 0], [1, 0, 0], [0, 0, 1]],
        'a': [[1, 1, 0], [1, 0, 0], [0, 0, 0]],
        'i': [[1, 0, 0], [1, 0, 0], [1, 0, 0]],
        'n': [[1, 0, 1], [1, 0, 0], [0, 0, 0]],
        'y': [[1, 0, 1], [0, 0, 0], [0, 1, 0]],
        'q': [[1, 0, 0], [1, 0, 0], [0, 0, 1]],
        'j': [[0, 0, 1], [0, 0, 1], [0, 1, 0]],
        'r': [[0, 1, 1], [0, 0, 0], [0, 1, 0]],
    },
    4: {
        'c': [[1, 0, 1], [0, 0, 0], [1, 0, 1]],
        'e': [[0, 1, 0], [1, 0, 1], [0, 1, 0]],
        'k': [[0, 1, 1], [1, 0, 0], [0, 0, 1]],
        'a': [[1, 0, 0], [1, 0, 0], [1, 1, 0]],
        'i': [[1, 0, 1], [1, 0, 1], [0, 0, 0]],
        'n': [[1, 0, 0], [1, 0, 0], [1, 0, 1]],
        'y': [[1, 0, 1], [0, 0, 0], [1, 1, 0]],
        'q': [[1, 1, 0], [1, 0, 0], [0, 0, 1]],
        'j': [[0, 0, 1], [1, 0, 1], [0, 1, 0]],
        'r': [[0, 1, 1], [0, 0, 1], [0, 1, 0]],
        't': [[1, 1, 1], [0, 0, 0], [0, 1, 0]],
        'w': [[1, 0, 0], [1, 0, 0], [0, 1, 1]],
        'z': [[1, 1, 0], [0, 0, 0], [0, 1, 1]],
    },
    5: {
        'c': [[0, 1, 0], [1, 0, 1], [1, 1, 0]],
        'e': [[1, 0, 1], [0, 0, 0], [1, 1, 1]],
        'k': [[1, 0, 1], [0, 0, 1], [1, 1, 0]],
        'a': [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
        'i': [[0, 1, 1], [0, 0, 1], [0, 1, 1]],
        'n': [[0, 1, 0], [0, 0, 1], [1, 1, 1]],
        'y': [[0, 1, 0], [1, 0, 1], [1, 0, 1]],
        'q': [[0, 1, 1], [0, 0, 1], [1, 1, 0]],
        'j': [[1, 1, 0], [1, 0, 0], [1, 0, 1]],
        'r': [[1, 0, 0], [1, 0, 1], [1, 0, 1]],
    },
    6: {
        'c': [[0, 1, 0], [1, 0, 1], [1, 1, 1]],
        'e': [[1, 0, 1], [0, 0, 1], [1, 1, 1]],
        'k': [[1, 0, 1], [1, 0, 1], [1, 1, 0]],
        'a': [[0, 0, 1], [1, 0, 1], [1, 1, 1]],
        'i': [[1, 0, 1], [1, 0, 1], [1, 0, 1]],
        'n': [[0, 1, 1], [1, 0, 1], [1, 1, 0]],
    },
    7: {
        'c': [[0, 1, 1], [1, 0, 1], [1, 0, 1]],
        'e': [[1, 0, 1], [1, 0, 1], [1, 1, 1]],
    },
    8: {
        '': [[1, 1, 1], [1, 0, 1], [1, 1, 1]],
    },
};

export function transitionGridToNumber(grid: TransitionGrid): number {
    return (grid[0][0] << 7) + (grid[0][1] << 6) + (grid[0][2] << 5) + (grid[1][0] << 4) + (grid[1][2] << 3) + (grid[2][0] << 2) + (grid[2][1] << 1) + grid[2][2];
}

let fullTransitions: {[key: number]: {[key: string]: Uint8Array}} = {};
for (let [number, letters] of Object.entries(TRANSITIONS)) {
    let outLetters: {[key: string]: Uint8Array} = {};
    for (let [letter, t] of Object.entries(letters)) {
        let allTransitions = new Set<number>();
        for (let j = 0; j < 5; j++) {
            t = [
                [t[2][0], t[1][0], t[0][0]],
                [t[2][1], t[1][1], t[0][1]],
                [t[2][2], t[1][2], t[0][2]],
            ];
            allTransitions.add(transitionGridToNumber(t));
            allTransitions.add(transitionGridToNumber([
                [t[0][2], t[0][1], t[0][0]],
                [t[1][2], t[1][1], t[1][0]],
                [t[2][2], t[2][1], t[2][0]],
            ]));
            allTransitions.add(transitionGridToNumber([
                [t[2][0], t[2][1], t[2][2]],
                [t[1][0], t[1][1], t[1][2]],
                [t[0][0], t[0][1], t[0][2]],
            ]));
        }
        outLetters[letter] = new Uint8Array(allTransitions);
    }
    fullTransitions[parseInt(number)] = outLetters;
}


let ruleCache = new Map<string, Rule>();

function splitDigitString(str: string): number[] {
    return Array.from(str, x => parseInt(x));
}

function parseSingleNumINTTransitions(num: number, minus: boolean, trs: string): [number, string][] {
    let out: [number, string][] = [];
    if (trs.length === 0) {
        for (let char in TRANSITIONS[num]) {
            out.push([num, char]);
        }
    } else if (minus) {
        let outTrs = Object.keys(TRANSITIONS[num]).join('');
        for (let char of trs) {
            if (!outTrs.includes(char)) {
                throw new Error(`Invalid isotropic transition for ${num}: ${char}`);
            }
            outTrs = outTrs.replace(char, '');
        }
        for (let char of outTrs) {
            out.push([num, char]);
        }
    } else {
        for (let char of trs) {
            if (!(char in TRANSITIONS[num])) {
                throw new Error(`Invalid isotropic transition for ${num}: ${char}`);
            }
            out.push([num, char]);
        }
    }
    return out;
}

function parseINTTransitions(data: string): Uint8Array {
    let allTrs: [number, string][] = [];
    let num = parseInt(data[0]);
    let minus = false;
    let trs = '';
    for (let char of data.slice(1)) {
        if ('012345678'.includes(char)) {
            allTrs.push(...parseSingleNumINTTransitions(num, minus, trs));
            num = parseInt(char);
            minus = false;
            trs = '';
        } else if (char === '-') {
            minus = true;
        } else {
            trs += char;
        }
    }
    allTrs.push(...parseSingleNumINTTransitions(num, minus, trs));
    let out: number[] = [];
    for (let [num, char] of allTrs) {
        out.push(...fullTransitions[num][char]);
    }
    return new Uint8Array(out);
}

function parseHROTTransitions(part: string, rule: string): number[] {
    let out: number[] = [];
    if (part.includes('-') || part.includes('..')) {
        let sections = part.split(/-|../);
        if (sections.length !== 2) {
            throw new Error(`Invalid HROT rule (more than 1 - or .. in a section): '${rule}'`);
        }
        let [start, end] = part.split('-');
        for (let i = parseInt(start); i <= parseInt(end); i++) {
            out.push(i);
        }
    } else {
        out.push(parseInt(part));
    }
    return out;
}

export function parseRule(rule: string): Rule {
    let cached = ruleCache.get(rule);
    if (cached !== undefined) {
        return cached;
    }
    let match: RegExpMatchArray | null;
    if (rule.startsWith('B')) {
        if (match = rule.match(/^B(\d*)\/S(\d*)$(?:\/C?(\d+))?$/)) {
            return {
                type: 'ot',
                b: splitDigitString(match[1]),
                s: splitDigitString(match[2]),
                c: match[3] ? parseInt(match[3]) : 2,
                n: 'moore',
                r: 1,
            };
        } else if (match = rule.match(/^B((?:\d-?[cekainyqjrtwz]*)*)\/S((?:\d-?[cekainyqjrtwz]*)*)(?:\/C?(\d+))?$/)) {
            return {
                type: 'int',
                b: parseINTTransitions(match[1]),
                s: parseINTTransitions(match[2]),
                c: match[3] ? parseInt(match[3]) : 2,
                n: 'moore',
                r: 1,
            }
        } else {
            throw new Error(`Invalid basic rule: ${rule}`);
        }
    } else if ('012345678/'.includes(rule[0])) {
        if (match = rule.match(/^(\d*)\/(\d*)(?:\/(\d+))?$/)) {
            return {
                type: 'ot',
                b: splitDigitString(match[2]),
                s: splitDigitString(match[1]),
                c: match[3] ? parseInt(match[3]) : 2,
                n: 'moore',
                r: 1,
            };
        } else if (match = rule.match(/^((?:\d-?[cekainyqjrtwz]*)*)\/((?:\d-?[cekainyqjrtwz]*)*)(?:\/(\d+))?$/)) {
            return {
                type: 'int',
                b: parseINTTransitions(rule[2]),
                s: parseINTTransitions(rule[1]),
                c: match[3] ? parseInt(match[3]) : 2,
                n: 'moore',
                r: 1,
            };
        } else {
            throw new Error(`Invalid Generations rule: ${rule}`);
        }
    } else if (rule.startsWith('R')) {
        let parts = rule.split(',');
        let r = 1;
        let c = 2;
        let m = 0;
        let s: number[] = [];
        let b: number[] = [];
        let n: Neighborhood = 'moore';
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            if (part.startsWith('R')) {
                r = parseInt(part.slice(1));
            } else if (part.startsWith('C')) {
                c = parseInt(part.slice(1));
            } else if (part.startsWith('M')) {
                m = parseInt(part.slice(1));
            } else if (part.startsWith('S') || part.startsWith('B')) {
                let list: number[] = [];
                let firstChar = part[0];
                part = part.slice(1);
                if (part.length !== 0) {
                    if (!'0123456789'.includes(part[0])) {
                        throw new Error(`Invalid HROT rule (character after S or B must be a digit or a comma): '${rule}'`);
                    }
                    list.push(...parseHROTTransitions(part, rule));
                }
                while (i < parts.length) {
                    let part = parts[++i];
                    if (part === undefined || !'0123456789'.includes(part[0])) {
                        break;
                    }
                    list.push(...parseHROTTransitions(part, rule));
                }
                i--;
                if (firstChar === 'S') {
                    s = list;
                } else {
                    b = list;
                }
            } else {
                throw new Error(`Invalid HROT rule (cannot parse section): '${rule}'`);
            }
        }
        if (m !== 0) {
            if (m !== 1) {
                throw new Error(`Invalid HROT rule (M is not 0 or 1): '${rule}'`);
            }
            s = s.map(x => x + 1);
            b = b.map(x => x + 1);
        }
        return {type: 'ot', r, c, s, b, n};
    } else if (rule.startsWith('b')) {
        if (match = rule.match(/^b(\d+)s(\d+)$/)) {
            return {
                type: 'ot',
                b: splitDigitString(match[1]),
                s: splitDigitString(match[2]),
                c: 2,
                n: 'moore',
                r: 1,
            };
        } else {
        throw new Error(`Invalid apgsearch outer-totalistic rule: ${rule}`);
        }
    } else if (rule.startsWith('g')) {
        if (match = rule.match(/^g(\d+)b(\d+)s(\d+)$/)) {
            return {
                type: 'ot',
                b: splitDigitString(match[2]),
                s: splitDigitString(match[3]),
                c: parseInt(match[1]),
                n: 'moore',
                r: 1,
            }
        } else {
        throw new Error(`Invalid apgsearch Generations rule: ${rule}`);
        }
    } else {
        throw new Error(`Cannot parse rule: ${rule}`);
    }
}
