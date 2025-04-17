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
83384316215;BRUNO ALEXANDRE SOARES PRESTES;0;20256;0;123456;1313;;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`;
    const expectedHeader = "cpf;nome;administrador;matricula;rfid;codigo;senha;barras;digitais";
    const expectedLine = "83384316215;BRUNO ALEXANDRE SOARES PRESTES;0;20256;0;123456;1313;;SUNSUzIxAAAJjgMBAAAAAMUAxQAEAUABAAAAgzwdWgAlAI4PVgCEAHkPwACOACgPbACUAH8MfgCUAJUOlwCVACcP1wCbAKIPUQCjAFkNKACuAE0PhwCzAJ0OaAC0ACwMMQC6AEUPzwC+ADEOVQDEAC8OvwDQADYOPADSADIPowDbAEIPfgDlAKsOGADpAEIPhwDrALkOJADtADoPdQDwAKUOpwD+AE0P1gABATwP4wAHAbsPmwAQAVkPXwARAQsOgwARAdEMcAAlAQcNNxcvEyf7If9OIBrnbYvSA4/5Ae2dC24obRntciL43ZaujVYDdX8qcTNvQS8W3O7gWQhiHir3YnCaCLp5uf7x11aQ4fhpF0oZrf4akQcJNQa9/w7YKQa+9J/p/e85B675MgyqiHr17PcxCM5qTAsqExf9YBM9FbJ41PsmCRP1ufzR7Q7VjfbyDcqVVYDL8PcKWYBPc2+HAQ6litajmQd2PU5qrXoRz2ItHf9ZO2uwrlCiDSAvAQHWGFMLAGcNDDfBPlEEAIQOE8DCDABbFgb//cHBwP3B/8H+DABVHBPD/WjC/cBLEAA3LP1AwD5PwUQSACw/6fwrTP9GVz0QAClJ7SPA/8EyTFoQACdT8f4vQEbAVA4AJV/t/iv//lT+wcASABZw6f8xO8E1S0YXAA6C5P8zM/9GRP3C+8L/SQoAUoKAwsLDwob/BABahAb+/A4AUoh3wMR5wsJFfAgAxI8iOEoRAGyQicX/wsPAxMGL/3HEDQCTkZxswYLBwoQJAMCSK8FMRhEAaJV6ecPCln/Awm0FAJuVIMAtDABwlg/8Mv78//84DgCXmStTQMA+IgUA3Zk6xEIDAGibE/4SAEyjacXDjMHBwcLAw8HDxqcJAGulHP/B/P39NQsAUKdan8KAqQkAWatXxMHEwsKWBgBoqyRP/BsABbHPLsD9Lv//+8BEwP1HPSALACeyU8PAwlvDwMIGAF2zScaIBQBks0DEdwQAabgpSgsAL71DhmfBjgYA08EwwEcHAM3CNMFG/wQAVcgwjwgAvNQ3T8DA+wgAw9Q0wDBtBQA91zR3CQCk30PB+sD/+x0GABjtQP+QBgAj8jfAhAUQpgRQwyIDENkFN/8EENMGOv//ABAAg04eVAB9AHgPfgB+AI4PbQCFAHsPwgCFACkPmACMACYPaACTABcPUACeAFYPKQCnAE0PZACnACcPiwCtAJ4PMgCzAEMP0ACzADEPVwC9ACwPPwDIADIPvADIADUPpgDQAEEPfADfAKsOiwDgALYOeADmAKQOIQDnADoPhQDwAIUO3ADzAEAOqgD2AE0P5QAAAUUO3AAGAb8OYwAJAQoOnQAKAWAPWwAaARQOyQAcAU4PUQAhASAOFf8uYE4kZRUKaFZ4VWT17ZEH0geP+J/38piqiVb/OZyx8dnDPTIZQ2IsWQxeHir6IRHt0rH/snlqen6L5fhpEibtsf8HCLvxKQfF/w7Y+fI9C/rmvfYtB5/oMQ6qjH72LArZ9AEpTQwZMD0VsPr5INHxJgsX+g/vleDJ0KndafyBgZL3je66yc6apIvlBJ76qH+BgSFzyfnS7E5q+RbC3dOs1PdBDU+TEZMWCgYTSA8+GDt/WQmMAiAvAQHcF7cLAHwQGsLARMDAOgQAixATXA4AbBoG/VhEQkwNAGMiDMD//1P+wf9PDgBWLQP+PcE2wFUUAEs0CcBEN0xU//x2AwDaQBb8EwBHQv39wP8+wEpA/l0MADpO9/04wD5RDwA2Vv04/sH9V8AyGQAuZPAoK0bA/v/A/Hb+/cP/RgoAInbnKv7//kIFAFB5esCdEwBYfAP9wfz//j5BR/4jCAB6fJDBjJEHAFGAd4ygDwBohoPEwMGSlsHAZggAxociOMBECwDBiSvBTME2/Q8AnIwgwPzD/ML//sD+wMDA/Q8Al5Anwf3APv9G/v3BAwBtlBP+FgBUm/r8/P7C+/3//MH7+fz7///+//wmEQBMnWfFxP+dwMLCwMPCw8TGCQBgpGfHoMOLBgBophcq/QUAJ6tTkgUAZKs3wcT/BQBesEDGcgYAbLEpwMD8/wcA1LYwXmgGAM63NMH/Uw0AMbhDjP+LiMQEAFnDLYwJAL3LNEb+wfvCBgA/zTR3wQkAp9VA//zA/h0GACXqN2zABwAf60B+lwYAqftMwSQEEO4BQ2UEEOEDRmkEEOcDRmkgEGcICcLEx4TCw8L/wsPCxsCNko3//4nBAxD0DEP/AxAcGzDCAxBdHRfCACAAgtYZWACEAHcPgQCLAI4PvwCUACYPbwCYAH0PlQCbACQP4gCcAKQPawCfABcPVACpAFgPZQCzACYPKwC1AE0PjQC4AJ0PNQDBAEMP0wDCADEPWgDJAC4PvgDWADMPQQDXADEPqADeAEEPjQDvALgOIwD0ADkP3gABAT4OrQADAUwP5wARAUMOagASAQkP3wAWAb4OoAAYAVwPKvwyYE4hWRINb1Z4ZoXWB4v1WGrp8lFb+ZuqiOKqZoEudjdzQJ618dnCPTUZQhLc8dElEa36WQxeHir3snhqen6L4fhpFkYWsQMijgMNJQq9/w7YwfYxB5/o/fI9B/rmMRKqiHr1snjibvpfKgsX+g/vbf2BgcP0jfLyDc6WqIbpBcv7W1B/rnO/rH6BgVN1/RLWp6tWiBEkACAmAQGgFn8EAJEWEFoJAIMZF21EwAwAcx4M/cLAPsE2DgBhJgb//sDBNkRKDwBZMv38R8H+wP5owP8TAFE4DGQ2/1VB+8VQDwBDRANEQFPAQBYAPU/9Ni9H/8H+/8D+WzgWADVc9ys+/8D+/8MqW8BQEAAzaPT+MEZE/cE1GQAod+0pM1T+wf7/wPzCVPzDRgYAVIV6wsGYGAAihuQnOy/C/Tb+Vz7ACAB+iZPDgZIOAGyTg8T/ksLCg3AKAMOXJ0pMQg8Ac5kM+y8q//7/+xgPAGuafcLBn8DDwnaFDQCYnCL/QP7BQTwDAG+gE/4WAFin+vv8wMD8/Sn89//5wP7///vA+xEAUKhnxMSAwYDAoMPGCQBgsF7FoMOYBgBosRb+/v/8GAAbs9f+LsH8/v8nwP9D/cA4/QUAZbc0wYMFACq5U8OCBQBgu0PHbgYAbbwnwP/9/wYA0cUxYMAHANfFLUT/wQoANMZGwot8wgQAWs0tjAcAwNg0RkIPAEHcMMHAhcTDxcXCkQUAJ/c3wI4FACH4PcHAwgQQrAlMwf4AREIBAQAAABYAAAAAAgUAAAAAAABFQg==";

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