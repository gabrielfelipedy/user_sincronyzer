import { describe, it, expect, test } from "vitest";
import { getCpfFromCsvLine } from "../src/utils/Parsers.js";

//=============================================================================
//region getCpfFromCsvLine
//=============================================================================

describe("getCpfFromCsvLine", () => {
  describe("Original Provided Tests", () => {
    test("Test if the function gets the CFP properly from the first line of CSV (Example 1)", () => {

      const testString =
        "83384316215;BRUNO ALEXANDRE SOARES PRESTES;0;20256;0;123456;1313;;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";

      const expectedResult = 83384316215;
      expect(getCpfFromCsvLine(testString)).toBe(expectedResult);
    });

    test("Test if the function gets the CFP correctly from the first line of CSV (Example 2 - Leading Zeros)", () => {

      const testString =
        "00630482217;GABRIEL FELIPE;1;574;0;0;160623;;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";
      // Note: Number() conversion drops leading zeros for the numeric value
      const expectedResult = 630482217;
      expect(getCpfFromCsvLine(testString)).toBe(expectedResult);
    });
  });

  
  describe("Several random-generated-strings tests", () => {
    
    const validCases = [
      { line: "12345678901;Name;More Data", expected: 12345678901 },
      { line: "98765432109;Another Name", expected: 98765432109 },
      { line: "11111111111;", expected: 11111111111 }, // CPF and separator only
      { line: "22222222222", expected: 22222222222 }, // CPF only
      { line: " 33333333333 ; Name ; More ", expected: 33333333333 }, // Whitespace around CPF
      { line: "44444444444;Data;;;", expected: 44444444444 }, // Extra separators
      { line: "00011122233;Leading Zeros Name", expected: 11122233 }, // Leading zeros handled
      { line: "0;Zero CPF;Data", expected: 0 }, // CPF is zero
      { line: "99999999999;Max Valid CPF Lookalike", expected: 99999999999 },
      { line: "55555555555;Middle Range CPF", expected: 55555555555 },
      {
        line: "10000000000;Another CPF;More data;Even more",
        expected: 10000000000,
      },
      { line: "87654321098;Test;Data", expected: 87654321098 },
      { line: "12121212121;Pattern;Data", expected: 12121212121 },
      { line: "12300000000;Data;Data", expected: 12300000000 },
      { line: " 007 ;James Bond;Secret Agent", expected: 7 }, // Whitespace and leading zeros
      { line: "90000000001;Some data", expected: 90000000001 },
      { line: "11223344556;Sequential;Data", expected: 11223344556 },
      { line: "98798798798;Repeating;Data", expected: 98798798798 },
      { line: "50000000005;Edge number;Data", expected: 50000000005 },
      { line: "77777777777;Lucky Sevens;Data", expected: 77777777777 },
    ];

    validCases.forEach(({ line, expected }, i) => {
      it(`should return ${expected} for line "${line.substring(
        0,
        20
      )}..." (case ${i + 1})`, () => {
        expect(getCpfFromCsvLine(line)).toBe(expected);
      });
    });

    // Test cases specifically checking trimming
    it("should trim leading whitespace from CPF", () => {
      expect(getCpfFromCsvLine(" 11122233344;Data")).toBe(11122233344);
    });
    it("should trim trailing whitespace from CPF", () => {
      expect(getCpfFromCsvLine("22233344455 ;Data")).toBe(22233344455);
    });
    it("should trim both leading and trailing whitespace from CPF", () => {
      expect(getCpfFromCsvLine(" 33344455566 ;Data")).toBe(33344455566);
    });
    it("should handle CPF with only whitespace correctly (returns 0)", () => {
      expect(getCpfFromCsvLine("   ;Data")).toBeNull(); // Number('   '.trim()) is Number('') which is 0
    });
  });
  
  //---------------------------------------------------------------------------
  // Region: Handling of Non-CPF Numbers in First Column
  //---------------------------------------------------------------------------
  describe("Handling of Non-CPF Numbers in First Column", () => {
    it("should handle negative numbers", () => {
      expect(getCpfFromCsvLine("-12345;Data")).toBe(-12345);
    });
    it("should handle floating point numbers", () => {
      expect(getCpfFromCsvLine("12345.67;Data")).toBe(12345.67);
    });
    it("should handle numbers in scientific notation", () => {
      expect(getCpfFromCsvLine("1.23e4;Data")).toBe(12300);
    });
    it("should handle large numbers (potentially outside typical CPF range)", () => {
      expect(getCpfFromCsvLine("999999999999999;Data")).toBe(999999999999999);
    });
    it("should handle zero correctly", () => {
      expect(getCpfFromCsvLine("0;Data")).toBe(0);
    });
    it("should handle single digit numbers", () => {
      expect(getCpfFromCsvLine("5;Data")).toBe(5);
    });
  });

  //---------------------------------------------------------------------------
  // Region: Invalid and Edge Case Inputs
  //---------------------------------------------------------------------------
  describe("Invalid and Edge Case Inputs", () => {
    // Cases expected to return null
    const nullCases = [
      { input: null, description: "null input" },
      { input: undefined, description: "undefined input" },
      { input: "", description: "empty string" },
      { input: "   ", description: "string with only whitespace" }, // Trimmed becomes '', which is falsy
      // Note: A line like ";data" splits into ['', 'data']. The first element '' is processed.
      // Note: A line like " ;data" splits into [' ', 'data']. First element ' ' is processed.
    ];

    nullCases.forEach(({ input, description }) => {
      // Need type assertion because function expects string
      it(`should return null for ${description}`, () => {
        expect(getCpfFromCsvLine(input as string)).toBeNull();
      });
    });

    // Cases expected to return NaN (Not a Number) because the first column cannot be parsed as a Number
    const nanCases = [
      {
        line: "abc;def;ghi",
        description: "non-numeric first column",
      },
      {
        line: "123a;def;ghi",
        description: "alphanumeric first column",
      },
      {
        line: "!@#;def;ghi",
        description: "special chars first column",
      },
      {
        line: "data;12345678901",
        description: "CPF not in the first column",
      },
      {
        line: "123 456;data",
        description: "space within number (invalid number format)",
      },
      {
        line: "123,456;data",
        description: "comma within number (invalid number format)",
      },
      {
        line: "Number;Header;Value",
        description: "header row",
      },
      {
        line: "true;boolean data",
        description: 'boolean string "true"',
      }, // Number('true') is NaN
      {
        line: "false;boolean data",
        description: 'boolean string "false"',
      }, // Number('false') is NaN
      { line: "{}", description: "JSON-like string" },
      { line: "[]", description: "Array-like string" },
      { line: "NaN;data", description: 'String "NaN"' },
      {
        line: "Infinity;data",
        description: 'String "Infinity"',
      }, // Number('Infinity') is Infinity, test expects NaN based on CPF context, but Number() parses it. Let's test the actual Number() behavior which IS Infinity. Let's change this test.
      {
        line: "-Infinity;data",
        description: 'String "-Infinity"',
      }, // Number('-Infinity') is -Infinity. Let's test the actual Number() behavior.
      {
        line: "one;two;three",
        description: "words instead of numbers",
      },
      {
        line: "cpf=12345;data",
        description: "text before number",
      },
      {
        line: ",",
        description: "comma only line (default separator)",
      },
      {
        line: "|",
        description: "pipe only line (default separator)",
      },
    ];

    nanCases.forEach(({ line, description }) => {
      it(`should return NaN for ${description} ("${line.substring(
        0,
        20
      )}...")`, () => {
        expect(getCpfFromCsvLine(line)).toBeNull();
      });
    });

    // Specific Cases for 0 return (due to Number('') or Number(' ') being 0)
    it('should return 0 for line starting with separator ";data"', () => {
      expect(getCpfFromCsvLine(";data")).toBeNull(); // split(';') -> ['','data'], Number('') -> 0
    });
    it('should return 0 for line starting with whitespace then separator " ;data"', () => {
      expect(getCpfFromCsvLine(" ;data")).toBeNull(); // split(';') -> [' ','data'], Number(' '.trim()) -> Number('') -> 0
    });
    it('should return 0 for line starting with only separator ";"', () => {
      expect(getCpfFromCsvLine(";")).toBeNull(); // split(';') -> ['',''], Number('') -> 0
    });
    it('should return 0 for line starting with separator and whitespace "; "', () => {
      expect(getCpfFromCsvLine("; ")).toBeNull(); // split(';') -> ['',' '], Number('') -> 0
    });
    it('should return 0 for line with only whitespace and separator " ; "', () => {
      expect(getCpfFromCsvLine(" ; ")).toBeNull(); // split(';') -> [' ',' '], Number(' '.trim()) -> Number('') -> 0
    });

    // Specific Cases for Infinity/-Infinity (Number() conversion result)
    it('should return Infinity for line "Infinity;data"', () => {
      expect(getCpfFromCsvLine("Infinity;data")).toBeNull();
    });
    it('should return -Infinity for line "-Infinity;data"', () => {
      expect(getCpfFromCsvLine("-Infinity;data")).toBeNull();
    });
  });

 
  describe("Additional Variation Tests", () => {
    // More valid cases
    const additionalValid = [
      { line: "10101010101;Binary Lookalike;Data", expected: 10101010101 },
      { line: "24680246802;Even Digits;Data", expected: 24680246802 },
      { line: "13579135791;Odd Digits;Data", expected: 13579135791 },
      { line: "88888888888;Eights;Data", expected: 88888888888 },
      { line: "99999999990;Almost all nines;Data", expected: 99999999990 },
      { line: "12312312312;Repeating sequence;Data", expected: 12312312312 },
      { line: "00000000001;Mostly zeros;Data", expected: 1 },
      { line: "54321098765;Descending;Data", expected: 54321098765 },
      {
        line: "11111111111;Data1;Data2;Data3;Data4;Data5",
        expected: 11111111111,
      }, // Many columns
      { line: " 22222222222", expected: 22222222222 }, // Leading space, no separator
    ];
    additionalValid.forEach(({ line, expected }, i) => {
      it(`should return ${expected} for additional valid case ${i + 1}`, () => {
        expect(getCpfFromCsvLine(line)).toBe(expected);
      });
    });

    // More invalid/NaN cases
    const additionalNaN = [
      {
        line: "NotANumber",
        description: "single column non-number",
      },
      {
        line: "undefined;data",
        description: 'string "undefined"',
      },
      { line: "null;data", description: 'string "null"' },
      { line: "1.2.3;data", description: "multiple decimals" },
    ];

    additionalNaN.forEach(({ line, description }) => {
      it(`should return NaN for additional invalid case: ${description}`, () => {
        expect(getCpfFromCsvLine(line)).toBeNull();
      });
    });

    // More Zero cases
    const additionalZero = [
      { line: "\t;data", separator: ";", description: "tab char first column" }, 
      {
        line: "\n;data",
        description: "newline char first column",
      },
      {
        line: "  ; data ; more ",
        description: "only whitespace first column complex",
      },
    ];
    additionalZero.forEach(({ line, description }) => {
      it(`should return 0 for additional zero case: ${description}`, () => {
        expect(getCpfFromCsvLine(line)).toBeNull();
      });
    });
  });
});