import { describe, test, expect } from 'vitest';
import { parseCsv } from '../src/utils/Parsers.js';


describe('parseCsv', () => {

  // Test 1: Standard case with header and multiple lines (using \n)
  test('should parse CSV with header and multiple lines using LF endings', () => {
    const csvString = "col1;col2;col3\nval1a;val1b;val1c\nval2a;val2b;val2c";
    const expected = {
      header: "col1;col2;col3",
      lines: ["val1a;val1b;val1c", "val2a;val2b;val2c"]
    };
    expect(parseCsv(csvString)).toEqual(expected);
  });

  // Test 2: Standard case with header and multiple lines (using \r\n)
  test('should parse CSV with header and multiple lines using CRLF endings', () => {
    const csvString = "col1;col2;col3\r\nval1a;val1b;val1c\r\nval2a;val2b;val2c";
    const expected = {
      header: "col1;col2;col3",
      lines: ["val1a;val1b;val1c", "val2a;val2b;val2c"]
    };
    expect(parseCsv(csvString)).toEqual(expected);
  });

  // Test 3: CSV with only a header row
  test('should return only header when CSV has just one line', () => {
    const csvString = "cpf;nome;administrador";
    const expected = {
      header: "cpf;nome;administrador",
      lines: []
    };
    expect(parseCsv(csvString)).toEqual(expected);
  });

  // Test 4: Empty input string
  test('should return empty header and empty lines for an empty string input', () => {
    const csvString = "";
    const expected = {
      header: "", // Function returns '' for empty string due to ternary
      lines: []
    };
    expect(parseCsv(csvString)).toEqual(expected);
  });

  // Test 5: Input string with only whitespace (spaces, tabs, newlines)
  test('should return empty header and empty lines for input with only whitespace', () => {
    const csvString = " \t \n \r\n ";
    const expected = {
      header: "", // .trim() makes it empty before split
      lines: []
    };
    expect(parseCsv(csvString)).toEqual(expected);
  });

  // Test 6: CSV with header and only one data line
  test('should correctly parse CSV with header and one data line', () => {
    const csvString = "ID;Name\n1;Alice";
    const expected = {
      header: "ID;Name",
      lines: ["1;Alice"]
    };
    expect(parseCsv(csvString)).toEqual(expected);
  });

  // Test 7: CSV with leading/trailing blank lines
  test('should ignore leading and trailing blank lines due to trim()', () => {
    // Note: .trim() removes surrounding whitespace including newlines *before* split
    const csvString = "\n\nHeader;Col\nData;Row1\n\n";
    const result = parseCsv(csvString);
    // After trim, the string becomes "Header;Col\nData;Row1".
    // Splitting this gives ["Header;Col", "Data;Row1"]
    const expected = {
      header: "Header;Col", 
      lines: ["Data;Row1"]
    };
    expect(result).toEqual(expected);
  });

  // Test 8: CSV with empty lines *between* data lines (should be preserved)
  test('should preserve empty lines between data lines', () => {
    const csvString = "Header\nData1\n\nData3"; // Assume no leading/trailing whitespace needing trim
    const expected = {
      header: "Header",
      lines: ["Data1", "", "Data3"] // The split operation creates the empty string
    };
    expect(parseCsv(csvString)).toEqual(expected);
  });

  // Test 9: Using the complex example provided in the prompt
  test('should correctly parse the complex user-provided example', () => {
    const csvString = `cpf;nome;administrador;matricula;rfid;codigo;senha;barras;digitais
83384666215;NOME EXEMPLO 01;0;25656;0;123123;13;;SUNSUzIxAAAJjgMBAAAAAMUAxQAEAUABAAAAgzwdWgAlAI4PVgCEAHkPwACOACgPbACUAH8MfgCUAJUOlwCVACcP1wCbAKIPUQCjAFkNKACuAE0PhwCzAJ0OaAC0ACwMMQC6AEUPzwC+ADEOVQDEAC8OvwDQADYOPADSADIPowDbAEIPfgDlAKsOGADpAEIPhwDrALkOJADtADoPdQDwAKUOpwD+AE0P1gABATwP4wAHAbsPmwAQAVkPXwARAQsOgwARAdEMcAAlAQcNNxcvEyf7If9OIBrnbYvSA4/`;

    const expectedHeader = "cpf;nome;administrador;matricula;rfid;codigo;senha;barras;digitais";
    
    const expectedLine = "83384666215;NOME EXEMPLO 01;0;25656;0;123123;13;;SUNSUzIxAAAJjgMBAAAAAMUAxQAEAUABAAAAgzwdWgAlAI4PVgCEAHkPwACOACgPbACUAH8MfgCUAJUOlwCVACcP1wCbAKIPUQCjAFkNKACuAE0PhwCzAJ0OaAC0ACwMMQC6AEUPzwC+ADEOVQDEAC8OvwDQADYOPADSADIPowDbAEIPfgDlAKsOGADpAEIPhwDrALkOJADtADoPdQDwAKUOpwD+AE0P1gABATwP4wAHAbsPmwAQAVkPXwARAQsOgwARAdEMcAAlAQcNNxcvEyf7If9OIBrnbYvSA4/";

    expect(parseCsv(csvString)).toEqual({
      header: expectedHeader,
      lines: [expectedLine]
    });
  });

  // Test 10: Header/Lines containing potential separators or quotes (should just be treated as text)
  test('should handle lines containing characters that might be separators', () => {
    const csvString = "Hea;der\n\"Data\";'Row1'\nMore,Data";
    const expected = {
      header: "Hea;der",
      lines: ["\"Data\";'Row1'", "More,Data"]
    };
    expect(parseCsv(csvString)).toEqual(expected);
  });

});