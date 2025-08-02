
import {parseRule, Rule, transitionGridToNumber} from './rule.js';


const RLE_CHARS = '.ABCDEFGHIJKLMNOPQRSTUVWX';
const RLE_EXT_CHARS = 'pqrstuvxwy';

export class Pattern {

    height: number = -1;
    width: number = -1;
    data: number[][];
    rule: string;
    parsedRule: Rule | null = null;
    period: number = -1;
    dx: number = -1;
    dy: number = -1;

    constructor(rule: string, data: number[][] = []) {
        this.data = data;
        this.rule = rule;
        this.resizeToFit();
    }

    get(x: number, y: number): number {
        return this.data[y]?.[x] ?? 0;
    }

    set(x: number, y: number, value: number): this {
        if (y > this.height - 1) {
            throw new Error(`Row ${y} is out of range`);
        }
        if (x > this.width - 1) {
            throw new Error(`Column ${x} is out of range`);
        }
        this.data[x][y] = value;
        return this;
    }

    resize(height: number, width: number): this {
        while (this.width < width) {
            this.data.forEach(x => x.push(0));
        }
        while (this.width > width) {
            this.data.forEach(x => x.pop());
        }
        while (this.height < height) {
            this.data.push(Array.from({length: width}, () => 0));
        }
        while (this.height > height) {
            this.data.pop();
        }
        this.height = height;
        this.width = width;
        return this;
    }

    resizeToFit(): this {
        this.width = Math.max(...this.data.map(x => x.length));
        if (this.width < 0) {
            this.width = 0;
        }
        this.height = this.data.length;
        for (let row of this.data) {
            while (row.length < this.width) {
                row.push(0);
            }
        }
        while (this.data.at(0)?.every(x => x === 0)) {
            this.data.shift();
        }
        while (this.data.at(-1)?.every(x => x === 0)) {
            this.data.pop();
        }
        while (this.data.every(x => x[0] === 0)) {
            this.data.forEach(x => x.shift());
        }
        while (this.data.every(x => x.at(-1) === 0)) {
            this.data.forEach(x => x.pop());
        }
        return this;
    }

    offsetBy(offsetX: number, offsetY: number): this {
        let newData = Array.from({length: this.height + offsetY}, () => Array.from({length: this.width + offsetX}).fill(0) as number[]);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                newData[y + offsetY][x + offsetX] = this.get(x, y);
            }
        }
        this.data = newData;
        this.height += offsetY;
        this.width += offsetX;
        return this;
    }

    getParsedRule(): Rule {
        if (!this.parsedRule) {
            this.parsedRule = parseRule(this.rule);
        }
        return this.parsedRule;
    }

    run(): Pattern {
        let p = new Pattern(this.rule, this.data);
        let rule = this.getParsedRule();
        p.parsedRule = rule;
        let sets: [number, number, number][] = [];
        for (let y = 0; y < p.height; y++) {
            for (let x = 0; x < p.width; x++) {
                let cell = p.get(x, y);
                if (rule.type === 'ot') {
                    let count = 0;
                    for (let ax = -rule.r; ax <= rule.r; ax++) {
                        for (let ay = -rule.r; ay <= rule.r; ay++) {
                            if (ax === 0 && ay === 0) {
                                continue;
                            }
                            if (p.get(x + ax, y + ay) !== 0) {
                                count++;
                            }
                        }
                    }
                    if (cell > 0) {
                        if (!rule.s.includes(count)) {
                            sets.push([x, y, (cell + 1) % rule.c]);
                        }
                    } else if (rule.b.includes(count)) {
                        sets.push([x, y, 1]);
                    }
                } else {
                    let cells = transitionGridToNumber([
                        // @ts-ignore
                        [p.get(x - 1, y - 1) > 0, p.get(x, y - 1) > 0, p.get(x + 1, y - 1) > 0],
                        // @ts-ignore
                        [p.get(x - 1, y) > 0, 0, p.get(x + 1, y) > 0],
                        // @ts-ignore
                        [p.get(x - 1, y + 1) > 0, p.get(x, y + 1) > 0, p.get(x + 1, y + 1) > 0],
                    ]);
                    if (cell > 0) {
                        if (!rule.s.includes(cells)) {
                            sets.push([x, y, (cell + 1) % rule.c]);
                        }
                    } else if (rule.b.includes(cells)) {
                        sets.push([x, y, 1]);
                    }
                }
            }
        }
        if (rule.r === 1) {
            let northInc = false;
            let westInc = false;
            for (let [x, y, value] of sets) {
                p.set(x, y, value);
                if (value > 0) {
                    if (x === 0) {
                        westInc = true;
                    }
                    if (x === p.width - 1) {
                        p.resize(p.height, p.width + 1);
                    }
                    if (y === 0) {
                        northInc = true;
                    }
                    if (y === p.height - 1) {
                        p.resize(p.height, p.width + 1);
                    }
                }
            }
            if (northInc || westInc) {
                p.offsetBy(Number(westInc), Number(northInc));
            }
        } else {
            let northRows = 0;
            let southRows = 0;
            let westCols = 0;
            let eastCols = 0;
            for (let [x, y, value] of sets) {
                p.set(x, y, value);
                if (value > 0) {
                    if (x < rule.r && westCols < x) {
                        westCols = x;
                    }
                    if (x >= p.width - rule.r && eastCols < p.width - x) {
                        eastCols = p.width - x;
                    }
                    if (y < rule.r && northRows < y) {
                        northRows = y;
                    }
                    if (y >= p.height - rule.r && southRows < p.width - x) {
                        southRows = p.width - x;
                    }
                }
            }
            if (northRows > 0 || westCols > 0) {
                p.offsetBy(westCols, northRows);
            }
            if (southRows > 0 || eastCols > 0) {
                p.resize(p.height + southRows, p.width + eastCols);
            }
        }
        return p.resizeToFit();
    }

    identify(): this {
        return this;
    }

    static fromRLE(rle: string): Pattern {
        let parts = rle.split('\n').filter(x => !x.startsWith('#'));
        if (parts.length < 2) {
            throw new Error('Invalid RLE');
        }
        let match = parts[0].match(/^x\s*=\s*(\d+)\s*,\s*y\s*=\s*(\d+)\s*,\s*rule\s*=\s*([^ ]*)$/);
        if (!match) {
            throw new Error('Invalid RLE');
        }
        let out = new Pattern(match[3]);
        let data = parts.slice(1).join('');
        let row: number[] = [];
        let num = '';
        for (let i = 0; i < data.length; i++) {
            let char = data[i];
            if ('0123456789'.includes(char)) {
                num += char;
            } else if (char === 'b' || char === 'o' || RLE_CHARS.includes(char) || RLE_EXT_CHARS.includes(char)) {
                let run = num === '' ? 1 : parseInt(num);
                let value: number;
                if (char === 'b') {
                    value = 0;
                } else if (char === 'o') {
                    value = 1;
                } else if (RLE_CHARS.includes(char)) {
                    value = RLE_CHARS.indexOf(char);
                } else {
                    let next = data[++i];
                    if (!RLE_CHARS.includes(char)) {
                        throw new Error(`Invalid character in RLE: ${char}`);
                    }
                    value = (RLE_EXT_CHARS.indexOf(char) + 1) * 24 + RLE_CHARS.indexOf(next);
                }
                for (let i = 0; i < run; i++) {
                    row.push(value);
                }
                num = '';
            } else if (char === '$') {
                out.data.push(row);
                if (num !== '') {
                    let run = parseInt(num);
                    for (let i = 1; i < run; i++) {
                        out.data.push([]);
                    }
                }
                row = [];
                num = '';
            } else if (char === '!') {
                out.data.push(row);
            } else {
                throw new Error(`Invalid character in RLE: '${char}'`);
            }
        }
        return out;
    }

}
