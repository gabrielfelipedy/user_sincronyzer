import { describe, it, expect, test } from "vitest";
import { getCpfFromCsvLine } from "../src/utils/Parsers.js";

//=============================================================================
//region getCpfFromCsvLine
//=============================================================================

describe("getCpfFromCsvLine", () => {
  describe("Original Provided Tests", () => {
    test("Test if the function gets the CFP properly from the first line of CSV (Example 1)", () => {

      const testString =
        "609572217;GABRIEL SOUZA;1;5774;0;166;183;;SUNSUzIxAAAJjgMBAAAAAMUAxQAEAUABAAAAgzwdWgAlAI4PVgCEAHkPwACOACgPbACUAH8MfgCUAJUOlwCVACcP1wCbAKIPUQCjAFkNKACuAE0PhwCzAJ0OaAC0ACwMMQC6AEUPzwC+ADEOVQDEAC8OvwDQADYOPADSADIPowDbAEIPfgDlAKsOGADpAEIPhwDrALkOJADtADoPdQDwAKUOpwD+AE0P1gABATwP4wAHAbsPmwAQAVkPXwARAQsOgwARAdEMcAAlAQcNNxcvEyf7If9OIBrnbYvSA4...";

      const expectedResult = 609572217;
      expect(getCpfFromCsvLine(testString)).toBe(expectedResult);
    });

    test("Test if the function gets the CFP correctly from the first line of CSV (Example 2 - Leading Zeros)", () => {

      const testString =
        "609572217;GABRIEL SOUZA;1;5774;0;166;183;;SUNSUzIxAAAL4gMBAAAAAMUAxQAEAUABAAAAhHAmRAAfAHQP0wAfABYPhQArAIUPNQAtAPkPxgA4AI0PwgBAABYPQABPAHQPbwBiAHkPsgB0ABwPJgB6AGcPSgB6APQP5QCBACQPVACSAGkPcQCbAHAPGQCnAFkP5ACxACwPuQCzAC0PLQC4AFIPtADEADYP2ADLADYPPgDOANoPRgDPAEkPXQDQAEUPfADQAC...";
      // Note: Number() conversion drops leading zeros for the numeric value
      const expectedResult = 609572217;
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
    const nanCases = [
      { line: null, description: "null input" },
      { line: undefined, description: "undefined input" },
      { line: "", description: "empty string" },
      { line: "   ", description: "string with only whitespace" },
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
      }, 
      {
        line: "false;boolean data",
        description: 'boolean string "false"',
      },
      { line: "{}", description: "JSON-like string" },
      { line: "[]", description: "Array-like string" },
      { line: "NaN;data", description: 'String "NaN"' },
      {
        line: "Infinity;data",
        description: 'String "Infinity"',
      }, 
      {
        line: "-Infinity;data",
        description: 'String "-Infinity"',
      }, 
      {
        line: "one;two;three",
        description: "words instead of numbers",
      },
      {
        line: "cpf=12345;data",
        description: "text before number",
      },
      {
        line: ";",
        description: "colon only line",
      },
      {
        line: "; ",
        description: "colon with space after",
      },
      {
        line: " ; ",
        description: "colon with space on both sides",
      },
      {
        line: ";data",
        description: "colon with non numeric data",
      },
      {
        line: " ;data",
        description: "colon with non numeric data and one space before",
      },
      {
        line: "|",
        description: "pipe only line (default separator)",
      },
    ];

    nanCases.forEach(({ line, description }) => {
      it(`should return Null for ${description}`, () => {
        expect(getCpfFromCsvLine(line ?? "")).toBeNull();
      });
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

  });
});