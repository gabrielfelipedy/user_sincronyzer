// src/parser.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseDuplicatedData } from "../src/utils/Parsers.js"; // Adjust path if needed
import { AFD } from "../src/models/interfaces/AFD.js";
import { Record } from "../src/models/interfaces/Record.js";
import { createTestString } from "./createTestString.module.js";

// --- Mocking Setup ---
vi.mock("../src/utils/Parsers.js", async (importOriginal) => {
  const originalModule = await importOriginal<
    typeof import("../src/utils/Parsers.js")
  >();
  return {
    ...originalModule,
    parseAFDString: vi.fn(),
  };
});

const mockedParseAFDString = vi.mocked(
  (await import("../src/utils/Parsers.js")).parseAFDString
);

// --- Test Suite ---
describe("parseDuplicatedData", () => {
  beforeEach(() => {
    mockedParseAFDString.mockReset();
  });

  // --- Test Cases ---

  it("1. should return an empty map when input data array is empty", () => {
    const inputData: AFD[] = [];
    const result = parseDuplicatedData(inputData);
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });

  it("2. should return an empty map when input AFD objects have empty afd arrays", () => {
    const inputData: AFD[] = [
      { clock_id: 1, afd: [] },
      { clock_id: 2, afd: [] },
    ];
    const result = parseDuplicatedData(inputData);
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });

  it("3. should return an empty map if parseAFDString always returns null", () => {
    // Use strings that look plausible but mock will treat as invalid
    const afdStr1 = "00000000152024-01-01T00:00:00-0300X111111111111"; // Conceptually invalid
    const afdStr2 = "0000000025invalidtimestamp---------Z122222222222"; // Conceptually invalid

    const inputData: AFD[] = [
      {
        clock_id: 1,
        afd: [afdStr1, afdStr2],
      },
    ];

    mockedParseAFDString.mockReturnValue(null);

    const result = parseDuplicatedData(inputData);

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
    //expect(mockedParseAFDString).toHaveBeenCalledTimes(2);
    // expect(mockedParseAFDString).toHaveBeenCalledWith(afdStr1, 1);
    // expect(mockedParseAFDString).toHaveBeenCalledWith(afdStr2, 1);
  });

  it("4. should correctly parse a single valid record", () => {
    const clockId = 5;
    const cpf = "12345678900";
    const timestamp = new Date("2024-01-01T10:00:00-03:00");
    const nsr = "000000101";
    const operation = "I";
    const afdStr = createTestString({
      nsr,
      timestamp: "2024-01-01T10:00:00-0300",
      operation,
      cpf,
    });
    // Example: "00000010152024-01-01T10:00:00-0300I123456789001"

    const inputData: AFD[] = [{ clock_id: clockId, afd: [afdStr] }];

    const expectedRecord: Record = {
      clock_id: clockId,
      cpf: Number(cpf),
      operation,
      timestamp: timestamp,
      nsr: Number(nsr),
      fullAfdString: afdStr,
    };

    mockedParseAFDString.mockReturnValueOnce(expectedRecord);

    const result = parseDuplicatedData(inputData);

    expect(result.size).toBe(1);
    expect(result.has(expectedRecord.cpf)).toBe(true);
    expect(result.get(expectedRecord.cpf)).toEqual(expectedRecord);
    //expect(mockedParseAFDString).toHaveBeenCalledWith(afdStr, clockId);
  });

  it("5. should keep the latest record for the same CPF based on timestamp", () => {
    const clockId = 10;
    const cpf = "11122233344";
    const timestampOld = new Date("2024-05-10T08:00:00-03:00");
    const timestampNew = new Date("2024-05-10T17:00:00-03:00"); // Later
    const nsrOld = "000000201";
    const nsrNew = "000000202";
    const afdStrOld = createTestString({
      nsr: nsrOld,
      timestamp: "2024-05-10T08:00:00-0300",
      operation: "E",
      cpf,
    });
    const afdStrNew = createTestString({
      nsr: nsrNew,
      timestamp: "2024-05-10T17:00:00-0300",
      operation: "I",
      cpf,
    });

    const inputData: AFD[] = [
      {
        clock_id: clockId,
        afd: [afdStrOld, afdStrNew],
      },
    ];
    const recordOld: Record = {
      clock_id: clockId,
      cpf: Number(cpf),
      operation: "E",
      timestamp: timestampOld,
      nsr: Number(nsrOld),
      fullAfdString: afdStrOld,
    };
    const recordNew: Record = {
      clock_id: clockId,
      cpf: Number(cpf),
      operation: "I",
      timestamp: timestampNew,
      nsr: Number(nsrNew),
      fullAfdString: afdStrNew,
    };

    mockedParseAFDString
      .mockReturnValueOnce(recordOld)
      .mockReturnValueOnce(recordNew);

    const result = parseDuplicatedData(inputData);

    expect(result.size).toBe(1);
    expect(result.has(recordNew.cpf)).toBe(true);
    expect(result.get(recordNew.cpf)).toEqual(recordNew); // Should be the newer record
    // expect(mockedParseAFDString).toHaveBeenCalledTimes(2);
    // expect(mockedParseAFDString).toHaveBeenCalledWith(afdStrOld, clockId);
    // expect(mockedParseAFDString).toHaveBeenCalledWith(afdStrNew, clockId);
  });

  it("6. should keep the latest record for the same CPF when newer record comes first in array", () => {
    const clockId = 11;
    const cpf = "11122233344";
    const timestampOld = new Date("2024-05-10T08:00:00-03:00");
    const timestampNew = new Date("2024-05-10T17:00:00-03:00"); // Later
    const nsrOld = "000000201";
    const nsrNew = "000000202";
    const afdStrOld = createTestString({
      nsr: nsrOld,
      timestamp: "2024-05-10T08:00:00-0300",
      operation: "E",
      cpf: cpf,
    });
    const afdStrNew = createTestString({
      nsr: nsrNew,
      timestamp: "2024-05-10T17:00:00-0300",
      operation: "I",
      cpf: cpf,
    });

    const inputData: AFD[] = [
      {
        clock_id: clockId,
        afd: [afdStrNew, afdStrOld], // Newer string first this time
      },
    ];
    const recordOld: Record = {
      clock_id: clockId,
      cpf: Number(cpf),
      operation: "E",
      timestamp: timestampOld,
      nsr: Number(nsrOld),
      fullAfdString: afdStrOld,
    };
    const recordNew: Record = {
      clock_id: clockId,
      cpf: Number(cpf),
      operation: "I",
      timestamp: timestampNew,
      nsr: Number(nsrNew),
      fullAfdString: afdStrNew,
    };

    mockedParseAFDString
      .mockReturnValueOnce(recordNew) // Mock returns new first
      .mockReturnValueOnce(recordOld);

    const result = parseDuplicatedData(inputData);

    expect(result.size).toBe(1);
    expect(result.has(recordNew.cpf)).toBe(true);
    expect(result.get(recordNew.cpf)).toEqual(recordNew); // Still the newer record
    //expect(mockedParseAFDString).toHaveBeenCalledTimes(2);
  });

  it("7. should handle multiple different CPFs correctly", () => {
    const clockId = 20;
    const cpf1 = "11111111111";
    const cpf2 = "22222222222";
    const timestamp1 = new Date("2024-05-11T09:00:00-03:00");
    const timestamp2 = new Date("2024-05-11T09:05:00-03:00");
    const nsr1 = "000000301";
    const nsr2 = "000000302";
    const afdStr1 = createTestString({
      nsr: nsr1,
      timestamp: "2024-05-11T09:00:00-0300",
      operation: "I",
      cpf: cpf1,
    });
    const afdStr2 = createTestString({
      nsr: nsr2,
      timestamp: "2024-05-11T09:05:00-0300",
      operation: "I",
      cpf: cpf2,
    });

    const inputData: AFD[] = [
      {
        clock_id: clockId,
        afd: [afdStr1, afdStr2],
      },
    ];
    const recordCpf1: Record = {
      clock_id: clockId,
      cpf: Number(cpf1),
      operation: "I",
      timestamp: timestamp1,
      nsr: Number(nsr1),
      fullAfdString: afdStr1,
    };
    const recordCpf2: Record = {
      clock_id: clockId,
      cpf: Number(cpf2),
      operation: "I",
      timestamp: timestamp2,
      nsr: Number(nsr2),
      fullAfdString: afdStr2,
    };

    mockedParseAFDString
      .mockReturnValueOnce(recordCpf1)
      .mockReturnValueOnce(recordCpf2);

    const result = parseDuplicatedData(inputData);

    expect(result.size).toBe(2);
    expect(result.has(recordCpf1.cpf)).toBe(true);
    expect(result.get(recordCpf1.cpf)).toEqual(recordCpf1);
    expect(result.has(recordCpf2.cpf)).toBe(true);
    expect(result.get(recordCpf2.cpf)).toEqual(recordCpf2);
    //expect(mockedParseAFDString).toHaveBeenCalledTimes(2);
  });

  it("8. should process records across multiple AFD objects in the input array", () => {
    const clockId1 = 30;
    const clockId2 = 31;
    const cpf1 = "11111111111";
    const cpf2 = "22222222222";
    const timestampCpf1Old = new Date("2024-05-12T10:00:00-03:00");
    const timestampCpf2 = new Date("2024-05-12T11:00:00-03:00");
    const timestampCpf1New = new Date("2024-05-12T12:00:00-03:00"); // Newer than Cpf1Old
    const nsr1Old = "000000401";
    const nsr2 = "000000402";
    const nsr1New = "000000403";

    const afdStrCpf1Old = createTestString({
      nsr: nsr1Old,
      timestamp: "2024-05-12T10:00:00-0300",
      operation: "E",
      cpf: cpf1,
    });
    const afdStrCpf2 = createTestString({
      nsr: nsr2,
      timestamp: "2024-05-12T11:00:00-0300",
      operation: "I",
      cpf: cpf2,
    });
    const afdStrCpf1New = createTestString({
      nsr: nsr1New,
      timestamp: "2024-05-12T12:00:00-0300",
      operation: "A",
      cpf: cpf1,
    });

    const inputData: AFD[] = [
      { clock_id: clockId1, afd: [afdStrCpf1Old] },
      { clock_id: clockId2, afd: [afdStrCpf2, afdStrCpf1New] },
    ];

    const recordCpf1Old: Record = {
      clock_id: clockId1,
      cpf: Number(cpf1),
      operation: "E",
      timestamp: timestampCpf1Old,
      nsr: Number(nsr1Old),
      fullAfdString: afdStrCpf1Old,
    };
    const recordCpf2: Record = {
      clock_id: clockId2,
      cpf: Number(cpf2),
      operation: "I",
      timestamp: timestampCpf2,
      nsr: Number(nsr2),
      fullAfdString: afdStrCpf2,
    };
    const recordCpf1New: Record = {
      clock_id: clockId2,
      cpf: Number(cpf1),
      operation: "A",
      timestamp: timestampCpf1New,
      nsr: Number(nsr1New),
      fullAfdString: afdStrCpf1New,
    };

    // Mock implementation based on string and clock_id
    mockedParseAFDString.mockImplementation((afdString, clock_id) => {
      if (afdString === afdStrCpf1Old && clock_id === clockId1)
        return recordCpf1Old;
      if (afdString === afdStrCpf2 && clock_id === clockId2) return recordCpf2;
      if (afdString === afdStrCpf1New && clock_id === clockId2)
        return recordCpf1New;
      return null;
    });

    const result = parseDuplicatedData(inputData);

    expect(result.size).toBe(2);
    // Check CPF 1 contains the newest record (from clockId2)
    expect(result.has(recordCpf1New.cpf)).toBe(true);
    expect(result.get(recordCpf1New.cpf)).toEqual(recordCpf1New);
    // Check CPF 2
    expect(result.has(recordCpf2.cpf)).toBe(true);
    expect(result.get(recordCpf2.cpf)).toEqual(recordCpf2);

    // expect(mockedParseAFDString).toHaveBeenCalledTimes(3);
    // expect(mockedParseAFDString).toHaveBeenCalledWith(afdStrCpf1Old, clockId1);
    // expect(mockedParseAFDString).toHaveBeenCalledWith(afdStrCpf2, clockId2);
    // expect(mockedParseAFDString).toHaveBeenCalledWith(afdStrCpf1New, clockId2);
  });

  it("9. should ignore null records returned by parseAFDString amidst valid ones", () => {
    const clockId = 40;
    const cpf1 = "33333333333";
    const cpf2 = "44444444444";
    const timestamp1 = new Date("2024-05-13T13:00:00-03:00");
    const timestamp2 = new Date("2024-05-13T14:00:00-03:00");
    const nsr1 = "000000501";
    const nsr2 = "000000502";
    const nsrInvalid = "599"; // For the string that will be mocked as null

    const afdStrValid1 = createTestString({
      nsr: nsr1,
      timestamp: "2024-05-13T13:00:00-0300",
      operation: "I",
      cpf: cpf1,
    });
    const afdStrInvalid = createTestString({
      nsr: nsrInvalid,
      timestamp: "2024-05-13T13:30:00-0300",
      operation: "E",
      cpf: "99999999999",
    }); // Realistic-looking but treated as invalid
    const afdStrValid2 = createTestString({
      nsr: nsr2,
      timestamp: "2024-05-13T14:00:00-0300",
      operation: "E",
      cpf: cpf2,
    });

    const inputData: AFD[] = [
      {
        clock_id: clockId,
        afd: [afdStrValid1, afdStrInvalid, afdStrValid2],
      },
    ];

    const record1: Record = {
      clock_id: clockId,
      cpf: Number(cpf1),
      operation: "I",
      timestamp: timestamp1,
      nsr: Number(nsr1),
      fullAfdString: afdStrValid1,
    };
    const record2: Record = {
      clock_id: clockId,
      cpf: Number(cpf2),
      operation: "E",
      timestamp: timestamp2,
      nsr: Number(nsr2),
      fullAfdString: afdStrValid2,
    };

    mockedParseAFDString
      .mockReturnValueOnce(record1)
      .mockReturnValueOnce(null) // Simulate invalid string parse
      .mockReturnValueOnce(record2);

    const result = parseDuplicatedData(inputData);

    expect(result.size).toBe(2);
    expect(result.has(record1.cpf)).toBe(true);
    expect(result.get(record1.cpf)).toEqual(record1);
    expect(result.has(record2.cpf)).toBe(true);
    expect(result.get(record2.cpf)).toEqual(record2);
    //expect(mockedParseAFDString).toHaveBeenCalledTimes(3);
    //expect(mockedParseAFDString).toHaveBeenCalledWith(afdStrInvalid, clockId); // Verify it was called even if result is null
  });

  it("10. should handle records with identical timestamps by keeping the first one encountered", () => {
    const clockId = 50;
    const cpf = "55555555555";
    const identicalTimestampValue = "2024-05-14T15:00:00-0300";
    const identicalTimestamp = new Date(identicalTimestampValue);
    const nsr1 = "000000601";
    const nsr2 = "000000602"; // Different NSR

    const afdStr1 = createTestString({
      nsr: nsr1,
      timestamp: identicalTimestampValue,
      operation: "E",
      cpf,
    });
    const afdStr2 = createTestString({
      nsr: nsr2,
      timestamp: identicalTimestampValue,
      operation: "I",
      cpf,
    }); // Same TS, same CPF, different op/NSR

    const inputData: AFD[] = [
      {
        clock_id: clockId,
        afd: [afdStr1, afdStr2], // afdStr2 processed last
      },
    ];

    const record1: Record = {
      clock_id: clockId,
      cpf: Number(cpf),
      operation: "E",
      timestamp: identicalTimestamp,
      nsr: Number(nsr1),
      fullAfdString: afdStr1,
    };
    const record2: Record = {
      clock_id: clockId,
      cpf: Number(cpf),
      operation: "I",
      timestamp: identicalTimestamp,
      nsr: Number(nsr2),
      fullAfdString: afdStr2,
    };

    mockedParseAFDString
      .mockReturnValueOnce(record1)
      .mockReturnValueOnce(record2); // record2 processed last

    const result = parseDuplicatedData(inputData);

    expect(result.size).toBe(1);
    expect(result.has(record1.cpf)).toBe(true);
    // Because record2 was processed last and timestamp isn't > record1's timestamp, we keep record 1
    expect(result.get(record1.cpf)).toEqual(record1);
    //expect(mockedParseAFDString).toHaveBeenCalledTimes(2);
  });
});
