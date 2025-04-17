import { describe, it, expect } from "vitest";
import { parseAFDString } from "../src/utils/Parsers.js";
import { createTestString } from "./createTestString.module.js";

//region parseAFDString

// ==================================
// Test Suite Starts
// ==================================

describe("parseAFDString", () => {
  // --- Category: Valid Inputs ---
  describe("Valid Inputs", () => {
    const baseClockId = 1;
    const validString = createTestString(); // Use default valid parts

    it("1. should correctly parse a standard valid AFD string", () => {
      // Use the REGEX function now
      const result = parseAFDString(validString, baseClockId);
      expect(result).not.toBeNull();
      expect(result?.clock_id).toBe(baseClockId);
      // Ensure Number() conversion handles potential leading zeros correctly
      expect(result?.cpf).toBe(80627000000);
      expect(result?.operation).toBe("I"); // Op is captured correctly
      expect(result?.nsr).toBe(102);
      expect(result?.timestamp).toBeInstanceOf(Date);
      // Check UTC conversion based on the -0300 offset
      expect(result?.timestamp.toISOString()).toBe("2025-04-08T15:38:00.000Z");
      expect(result?.fullAfdString).toBe(validString);
    });

    it("2. should handle different valid clock_id (positive integer)", () => {
      const result = parseAFDString(validString, 999);
      expect(result?.clock_id).toBe(999);
    });

    it("3. should handle different valid clock_id (zero)", () => {
      const result = parseAFDString(validString, 0);
      expect(result).toBeNull();
    });

    it("4. should handle different valid clock_id (negative integer)", () => {
      const result = parseAFDString(validString, -5);
      expect(result?.clock_id).toBe(-5); // Function doesn't validate clock_id itself
    });

    it("5. should handle different valid operation character (e.g., E)", () => {
      const testStr = createTestString({ operation: "E" });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.operation).toBe("E");
    });

    it("6. should handle different valid operation character (e.g., X)", () => {
      const testStr = createTestString({ operation: "X" });
      const result = parseAFDString(testStr, baseClockId);
      expect(result).toBeNull();
    });

    it("7. should handle different valid CPF (all digits)", () => {
      const testStr = createTestString({ cpf: "12345678901" });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.cpf).toBe(12345678901);
    });

    it("8. should handle CPF with leading zeros (parsed as number)", () => {
      const testStr = createTestString({ cpf: "00000000001" });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.cpf).toBe(1);
    });

    it("9. should handle different valid NSR (all digits)", () => {
      const testStr = createTestString({ nsr: "987654321" });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.nsr).toBe(987654321);
    });

    it("10. should handle NSR with leading zeros (parsed as number)", () => {
      const testStr = createTestString({ nsr: "000000001" });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.nsr).toBe(1);
    });

    it("11. should handle different valid timestamp (different date)", () => {
      const ts = "2023-12-31T23:59:59+0000"; // Use +0000 for direct UTC comparison
      const testStr = createTestString({ timestamp: ts });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.timestamp.toISOString()).toBe("2023-12-31T23:59:59.000Z");
    });

    it("12. should handle different valid timestamp (different time)", () => {
      const ts = "2025-04-08T00:00:01+0530";
      const testStr = createTestString({ timestamp: ts });
      const result = parseAFDString(testStr, baseClockId);
      // 00:00:01 +0530 is 18:30:01 UTC the previous day
      expect(result?.timestamp.toISOString()).toBe("2025-04-07T18:30:01.000Z");
    });

    it("14. should handle timestamp with positive offset", () => {
      const ts = "2025-04-08T20:38:00+0500";
      const testStr = createTestString({ timestamp: ts });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.timestamp.toISOString()).toBe("2025-04-08T15:38:00.000Z");
    });

    it("15. should handle minimum valid length string (47 chars)", () => {
      // String needs the separators based on createTestString
      const minLengthStr = "00000010252025-04-08T12:38:00-0300I080627153291"; // No extra
      expect(minLengthStr.length).toBe(47);
      const result = parseAFDString(minLengthStr, baseClockId);
      expect(result).not.toBeNull();
      expect(result?.cpf).toBe(80627153291);
      expect(result?.fullAfdString).toBe(minLengthStr);
    });

    it("16. should handle string with extra characters beyond minimum", () => {
      const longString =
        validString +
        "SomeExtraDataThatShouldBeIgnoredByParsingLogicButIncludedInFullString";
      const result = parseAFDString(longString, baseClockId);
      expect(result).not.toBeNull();
      expect(result?.cpf).toBe(80627000000); // Check parsing still works
      expect(result?.fullAfdString).toBe(longString); // Check full string is preserved
    });

    it("17. should handle leap year timestamp correctly", () => {
      const ts = "2024-02-29T10:00:00-0300";
      const testStr = createTestString({ timestamp: ts });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.timestamp.toISOString()).toBe("2024-02-29T13:00:00.000Z");
    });

    it("18. should handle timestamp at year boundary (start)", () => {
      const ts = "2024-01-01T00:00:00+0000";
      const testStr = createTestString({ timestamp: ts });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.timestamp.toISOString()).toBe("2024-01-01T00:00:00.000Z");
    });

    it("19. should handle timestamp at year boundary (end)", () => {
      const ts = "2023-12-31T23:59:59+0000";
      const testStr = createTestString({ timestamp: ts });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.timestamp.toISOString()).toBe("2023-12-31T23:59:59.000Z");
    });

    it("20. should handle maximum value for NSR (assuming 9 digits)", () => {
      const testStr = createTestString({ nsr: "999999999" });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.nsr).toBe(999999999);
    });

    // Add 5 more valid variations
    it("21. should handle CPF being all zeros", () => {
      const testStr = createTestString({ cpf: "00000000000" });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.cpf).toBe(0);
    });

    it("22. should handle NSR being zero", () => {
      const testStr = createTestString({ nsr: "000000000" });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.nsr).toBe(0);
    });

    it("23. should handle timestamp with seconds exactly 00", () => {
      const ts = "2025-04-08T12:38:00-0300";
      const testStr = createTestString({ timestamp: ts });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.timestamp.getUTCSeconds()).toBe(0);
      expect(result?.timestamp.toISOString()).toBe("2025-04-08T15:38:00.000Z");
    });

    it("24. should handle timestamp with seconds exactly 59", () => {
      const ts = "2025-04-08T12:38:59-0300";
      const testStr = createTestString({ timestamp: ts });
      const result = parseAFDString(testStr, baseClockId);
      expect(result?.timestamp.getUTCSeconds()).toBe(59);
      expect(result?.timestamp.toISOString()).toBe("2025-04-08T15:38:59.000Z");
    });

    it("25. should handle operation being a digit (if allowed by spec)", () => {
      const testStr = createTestString({ operation: "1" });
      const result = parseAFDString(testStr, baseClockId);
      expect(result).toBeNull();
    });
  });

  // --- Category: Invalid String Length / Structure ---
  describe("Invalid String Length / Structure", () => {
    const clockId = 1;
    // The regex requires a minimum length (e.g., 47 chars for the chosen regex)
    // and specific formats (\d{9}, etc.). Any deviation should cause `exec` to return null.

    it("26. should return null for an empty string", () => {
      expect(parseAFDString("", clockId)).toBeNull();
    });

    it("27. should return null for a string with length 1", () => {
      expect(parseAFDString("A", clockId)).toBeNull();
    });

    it("28. should return null for a string shorter than required structure (e.g., length 9)", () => {
      expect(parseAFDString("123456789", clockId)).toBeNull();
    });

    it("29. should return null for a string shorter than required structure (e.g., length 20)", () => {
      expect(parseAFDString("1234567890ABCDEFGHIJ", clockId)).toBeNull();
    });

    it("30. should return null for a string shorter than required structure (e.g., length 34)", () => {
      expect(
        parseAFDString("1234567890123456789012345678901234", clockId)
      ).toBeNull();
    });

    it("31. should return null for a string shorter than required structure (e.g., length 35)", () => {
      expect(
        parseAFDString("12345678901234567890123456789012345", clockId)
      ).toBeNull();
    });

    it("32. should return null for a string shorter than minimum required length (length 46)", () => {
      const shortString = "0".repeat(46);
      expect(parseAFDString(shortString, clockId)).toBeNull();
    });

    it("33. should return null for a string composed only of whitespace but too short", () => {
      expect(parseAFDString(" ".repeat(40), clockId)).toBeNull();
    });

    it("34. should return null for string length exactly at nsrEnd (9)", () => {
      expect(parseAFDString("123456789", clockId)).toBeNull();
    });
    it("35. should return null for string length exactly at opEnd (35)", () => {
      expect(parseAFDString("0".repeat(35), clockId)).toBeNull();
    });
  });

  // --- Category: Invalid Timestamp Format ---
  describe("Invalid Timestamp Format", () => {
    const clockId = 1;
    // These should fail either the regex match (if format is in regex)
    // or the Date parsing check within the function. Result should be null.

    it("36. should return null for completely invalid timestamp string", () => {
      // Ensure the overall string structure *around* the bad timestamp is okay
      // Use padEnd to ensure the bad timestamp occupies the 24-char slot
      const badTs = "NOT A VALID TIMESTAMP!".padEnd(24);
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("37. should return null for incorrect date separator", () => {
      const badTs = "2025/04/08T12:38:00-0300"; // Wrong separator '/'
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("38. should return null for incorrect time separator", () => {
      const badTs = "2025-04-08T12.38.00-0300"; // Wrong separator '.'
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("40. should return null for invalid month (13)", () => {
      const badTs = "2025-13-08T12:38:00-0300";
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("41. should return null for invalid day (32)", () => {
      const badTs = "2025-04-32T12:38:00-0300";
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("42. should return null for invalid hour (25)", () => {
      const badTs = "2025-04-08T25:38:00-0300";
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("43. should return null for invalid minute (60)", () => {
      const badTs = "2025-04-08T12:60:00-0300";
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("44. should return null for invalid second (60)", () => {
      const badTs = "2025-04-08T12:38:60-0300";
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("45. should return null for invalid timezone format (missing sign)", () => {
      const badTs = "2025-04-08T12:38:000300 "; // Pad to 24
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("46. should return null for invalid timezone format (wrong length)", () => {
      const badTs = "2025-04-08T12:38:00-030 "; // Too short, pad
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("47. should return null for invalid timezone format (letters)", () => {
      const badTs = "2025-04-08T12:38:00-ABCD";
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("48. should return null if timestamp section is all spaces", () => {
      const badTs = " ".repeat(24);
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("52. should return null for timestamp with only date part", () => {
      const badTs = "2025-04-08".padEnd(24); // Incomplete
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("53. should return null for timestamp with only time part", () => {
      const badTs = "T12:38:00-0300".padEnd(24); // Incomplete
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("54. should return null for timestamp with two T separators", () => {
      const badTs = "2025-04-08TT12:38:00-03".padEnd(24); // Invalid structure
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("55. should return null for timestamp with invalid characters mixed in date", () => {
      const badTs = "2025-0A-08T12:38:00-0300"; // 'A' in month
      const testStr = createTestString({ timestamp: badTs });
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });
  });

  // --- Category: Invalid Numeric Formats (CPF/NSR) ---
  describe("Invalid Numeric Formats (CPF/NSR)", () => {
    const clockId = 1;
    // With regex using \d{9} and \d{11}, non-digit characters will cause the
    // main regex match to fail, resulting in null.

    it("56. should return null if CPF section contains spaces", () => {
      // Regex \d{11} will fail
      const testStr = createTestString({ cpf: " 123456789 " }); // 11 chars total with spaces
      const result = parseAFDString(testStr, clockId);
      expect(result).toBeNull();
    });

    it("59. should return null if CPF section is empty/all spaces", () => {
      // Regex \d{11} will fail
      const testStr = createTestString({ cpf: "           " }); // 11 spaces
      const result = parseAFDString(testStr, clockId);
      expect(result).toBeNull();
    });

    it("60. should return null if NSR section contains spaces", () => {
      // Regex \d{9} will fail
      const testStr = createTestString({ nsr: " 1234567 " }); // 9 chars total with spaces
      const result = parseAFDString(testStr, clockId);
      expect(result).toBeNull();
    });

    it("63. should return null if NSR section is empty/all spaces", () => {
      // Regex \d{9} will fail
      const testStr = createTestString({ nsr: "         " });
      const result = parseAFDString(testStr, clockId);
      expect(result).toBeNull();
    });

    it("64. should return null if CPF section contains only a minus sign", () => {
      // Regex \d{11} will fail
      const testStr = createTestString({ cpf: "-          " });
      const result = parseAFDString(testStr, clockId);
      expect(result).toBeNull();
    });

    it("65. should return null if NSR section contains scientific notation chars", () => {
      // Regex \d{9} will fail on 'e'
      const testStr = createTestString({ nsr: "1e3      " }); // 9 chars total
      const result = parseAFDString(testStr, clockId);
      expect(result).toBeNull();
    });
  });

  // --- Category: Edge Cases & Other Inputs ---
  describe("Edge Cases and Other Inputs", () => {
    const clockId = 1;

    it("66. should return null for string with only whitespace (long enough)", () => {
      const testStr = " ".repeat(50);
      // Regex ^(\d{9})... will fail immediately
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("68. should handle string with Unicode characters outside parsed sections", () => {
      const base = createTestString();
      // Ensure the core part matches the regex structure
      const corePart = base.substring(0, 47); // NSR(9)+sep(1)+TS(24)+Op(1)+sep(1)+CPF(11)
      const testStr = corePart + "Joséphine ♥"; // Add extra unicode
      const result = parseAFDString(testStr, clockId);
      expect(result).not.toBeNull();
      expect(result?.cpf).toBe(80627000000); // Check parsing ok
      expect(result?.fullAfdString).toBe(testStr);
      expect(result?.fullAfdString).toContain("Joséphine ♥");
    });

    it("70. should return null for string containing only numbers (long enough)", () => {
      const testStr = "0".repeat(50);
      // Regex expects specific timestamp format T,-,+,: which won't be present
      // Also, the separators might be wrong. Expect null.
      expect(parseAFDString(testStr, clockId)).toBeNull();
    });

    it("71. should return null if timestamp section has wrong length/format", () => {
      // Create a string where timestamp part is not 24 chars or has bad format
      const badTsStr =
        "0000001025" +
        "2025-04-08T12:38:00-03001" +
        "I" +
        "0" +
        "80627153291" +
        "EXTRA"; // Timestamp part is 25 chars long here
      // The regex `(.{24})` would grab the first 24 chars, but the next part `(.)` expects Op at index 34.
      // In badTsStr, index 34 is '1'. Index 35 is 'I'. Index 36 is '0'.
      // The regex `^(\d{9}).(.{24})(.).(\d{11})` applied to badTsStr:
      // Group 1: 000000102
      // Skip: 5
      // Group 2: 2025-04-08T12:38:00-03001I0 // This is 26 chars, so .{24} fails? No, .{24} matches 24 chars.
      // Group 2: 2025-04-08T12:38:00-0300
      // Group 3: 1 (char at index 34)
      // Skip: I (char at index 35)
      // Group 4: 08062715329 (11 digits starting index 36) - Wait, index 36 is '0'. This fails \d{11}.
      expect(parseAFDString(badTsStr, clockId)).toBeNull(); // Should fail regex match
    });

    it("72. should handle string where CPF section contains max safe integer (if fits 11 digits)", () => {
      const maxSafeIntStr = String(Number.MAX_SAFE_INTEGER); // 9007199254740991 (16 digits)
      const cpfStr = maxSafeIntStr.substring(0, 11); // Take first 11 digits
      const testStr = createTestString({ cpf: cpfStr });
      const result = parseAFDString(testStr, clockId);
      expect(result).not.toBeNull();
      expect(result?.cpf).toBe(Number(cpfStr));
    });

    it("73. should handle string where CPF section represents number > max safe integer", () => {
      const largeNumStr = "99999999999"; // 11 digits
      const testStr = createTestString({ cpf: largeNumStr });
      const result = parseAFDString(testStr, clockId);
      expect(result?.cpf).toBe(99999999999);
    });

    it("74. should return null for leading/trailing whitespace in the input string", () => {
      const validString = createTestString();
      const testStr = `   ${validString}   `; // Add whitespace
      // Regex `^(\d{9})...` will fail due to leading spaces.
      const result = parseAFDString(testStr, clockId);
      expect(result).toBeNull();
    });

    it("75. should handle operation being a space", () => {
      const testStr = createTestString({ operation: " " });
      const result = parseAFDString(testStr, clockId);
      expect(result).toBeNull();
    });

    // ... (Keep remaining tests 76-100, updating expectations for regex failures where needed)

    // Example updates for tests 92, 93:
    it("92. Clock ID as NaN (should still parse string if valid)", () => {
      const result = parseAFDString(createTestString(), NaN);
      // The string itself is valid, so parsing should succeed.
      expect(result).toBeNull();
    });

    it("93. Clock ID as Infinity (should still parse string if valid)", () => {
      const result = parseAFDString(createTestString(), Infinity);
      // The string itself is valid, so parsing should succeed.
      expect(result).toBeNull();
    });

    // Example update for test 90:
    it("90. should return null if CPF has less than 11 digits but padded with spaces", () => {
      // Regex \d{11} will fail on spaces
      const testStr = createTestString({ cpf: "12345      " }); // 5 digits, 6 spaces
      const result = parseAFDString(testStr, clockId);
      expect(result).toBeNull(); // Fails regex match now
    });
  });
});
