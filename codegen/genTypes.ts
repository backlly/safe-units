import {
    EXPONENTS,
    genFileHeader,
    genImport,
    genUncurriedTypeName,
    genValueName,
    indent,
    OperatorCodeGenOptions,
} from "./common";

export function genOperatorTypes(options: OperatorCodeGenOptions): string {
    let lines: string[] = [...genFileHeader(), ...genImports(), ...genUncurriedType(options)];
    for (const left of EXPONENTS) {
        if (!(left in options.specialCases)) {
            lines.push(...genCurriedType(options, left));
        }
    }
    return lines.join("\n");
}

export function genImports(): string[] {
    return [genImport(["ArithmeticError", "Exponent"], "./common"), ""];
}

function genUncurriedType(options: OperatorCodeGenOptions): string[] {
    const lines = [`export type ${genUncurriedTypeName(options, "L extends Exponent", "R extends Exponent")}`];
    let first = true;
    for (const left of EXPONENTS) {
        const operator = first ? "=" : ":";
        const prefix = indent(`${operator} L extends ${left} ?`);
        first = false;
        if (left in options.specialCases) {
            lines.push(`${prefix} ${options.specialCases[left]}`);
        } else {
            lines.push(`${prefix} ${genCurriedTypeName(options, left)}<R>`);
        }
    }
    lines.push(genErrorCase());
    lines.push("");
    return lines;
}

function genCurriedType(options: OperatorCodeGenOptions, left: number): string[] {
    const lines = [`export type ${genCurriedTypeName(options, left)}<N extends Exponent>`];
    let first = true;
    for (const right of EXPONENTS) {
        const result = options.compute(left, right);
        if (EXPONENTS.indexOf(result) !== -1) {
            const operator = first ? "=" : ":";
            first = false;
            lines.push(indent(`${operator} N extends ${right} ? ${result}`));
        }
    }
    lines.push(genErrorCase());
    lines.push("");
    return lines;
}

function genCurriedTypeName({ curriedTypeNamePrefix }: OperatorCodeGenOptions, value: number): string {
    return `${curriedTypeNamePrefix}${genValueName(value)}`;
}

function genErrorCase() {
    return indent(": ArithmeticError;");
}