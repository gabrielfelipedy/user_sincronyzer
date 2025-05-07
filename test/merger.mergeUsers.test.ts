// src/mergeUsers.test.ts
import { describe, it, expect } from 'vitest';
import { MergeUsers } from '../src/utils/Merger.js';

// --- Test Data ---
// The long example string provided in the prompt
const complexString1 = "83384666215;NOME EXEMPLO 01;0;25656;0;123123;13;;SUNSUzIxAAAJjgMBAAAAAMUAxQAEAUABAAAAgzwdWgAlAI4PVgCEAHkPwACOACgPbACUAH8MfgCUAJUOlwCVACcP1wCbAKIPUQCjAFkNKACuAE0PhwCzAJ0OaAC0ACwMMQC6AEUPzwC+ADEOVQDEAC8OvwDQADYOPADSADIPowDbAEIPfgDlAKsOGADpAEIPhwDrALkOJADtADoPdQDwAKUOpwD...";

// A variation based on the second part of the example
const complexString2 = "609572217;GABRIEL SOUZA;1;5774;0;166;183;;+AI4PbQCFAHsPwgCFACkPmACMACYPaACTABcPUACeAFYPKQCnAE0PZACnACcPiwCtAJ4PMgCzAEMP0ACzADEPVwC9ACwPPwDIADIPvADIADUPpgDQAEEPfADfAKsOiwDgALYOeADmAKQOIQDnADoPhQDwAIUO3ADzAEAOqgD2AE0P5QAAAUUO3AAGAb8OYwAJAQoOnQAKAWAPWwAaARQOyQAcAU4PUQAhASAOFf8uYE4kZRUKaFZ4V...";

// A variation based on the third part of the example
const complexString3 = "70000484923;HELINGTON;0;13;0;3533;163;;gtYZWACEAHcPgQCLAI4PvwCUACYPbwCYAH0PlQCbACQP4gCcAKQPawCfABcPVACpAFgPZQCzACYPKwC1AE0PjQC4AJ0PNQDBAEMP0wDCADEPWgDJAC4PvgDWADMPQQDXADEPqADeAEEPjQDvALgOIwD0ADkP3gABAT4OrQADAUwP5wARAUMOagASAQkP3wAWAb4OoAAYAVwPKvwyYE4hWRINb1Z4ZoXWB4v1WGrp8lFb+ZuqiOKqZoEudjdzQJ618dnCPTUZQhLc8dElEa36WQxeHir3snhqen6L4fhpFkYWsQMijgMNJQq9/w7YwfYxB5/o/fI9B/rmMRKqiHr1snjibvpfKgsX+g/...";

// --- Test Suite ---
describe('MergeUsers', () => {

  it('should return an empty string when the input map is empty', () => {
    const usersMap = new Map<number, string>();
    expect(MergeUsers(usersMap)).toBe('');
  });

  it('should return the single string without newlines for a map with one entry', () => {
    const usersMap = new Map<number, string>();
    usersMap.set(1, 'header1,header2,header3');
    expect(MergeUsers(usersMap)).toBe('header1,header2,header3');
  });

  it('should merge multiple simple CSV strings correctly, preserving insertion order', () => {
    const usersMap = new Map<number, string>();
    // Keys don't matter, but insertion order might depending on JS engine Map impl.
    usersMap.set(101, "ID;NAME;ACTIVE");
    usersMap.set(5, "1;Alice;1"); // Non-sequential key
    usersMap.set(303, "2;Bob;0");

    const expected = "ID;NAME;ACTIVE\n1;Alice;1\n2;Bob;0";
    expect(MergeUsers(usersMap)).toBe(expected);
  });

  it('should handle entries with empty strings, resulting in blank lines', () => {
    const usersMap = new Map<number, string>();
    usersMap.set(1, "Line 1");
    usersMap.set(2, ""); // Empty string value
    usersMap.set(3, "Line 3");
    usersMap.set(4, ""); // Another empty one

    const expected = "Line 1\n\nLine 3\n"; // Note the double newline and trailing newline
    expect(MergeUsers(usersMap)).toBe(expected);
  });

   it('should handle leading/trailing empty strings correctly', () => {
    const usersMap = new Map<number, string>();
    usersMap.set(99, "");
    usersMap.set(100, "Data Line");
    usersMap.set(101, "");

    const expected = "\nData Line\n";
    expect(MergeUsers(usersMap)).toBe(expected);
  });

  it('should preserve existing newlines within the strings and add newlines between strings', () => {
    const usersMap = new Map<number, string>();
    usersMap.set(1, "multi\nline\nstring 1");
    usersMap.set(2, "single line string 2");
    usersMap.set(3, "multi\nline\nstring 3");

    const expected = "multi\nline\nstring 1\nsingle line string 2\nmulti\nline\nstring 3";
    expect(MergeUsers(usersMap)).toBe(expected);
  });

  it('should correctly merge the complex example strings provided', () => {
    const usersMap = new Map<number, string>();
    // Use different keys, as they don't influence the output string content
    usersMap.set(83384316215, complexString1);
    usersMap.set(12345678901, complexString2); // Different key
    usersMap.set(98765432109, complexString3); // Yet another different key

    // Expected output is the concatenation of the strings in the order they were added (Map preserves insertion order)
    const expected = `${complexString1}\n${complexString2}\n${complexString3}`;
    expect(MergeUsers(usersMap)).toBe(expected);
  });

   it('should handle only complex strings', () => {
    const usersMap = new Map<number, string>();
    usersMap.set(1, complexString2);
    usersMap.set(2, complexString1); // Different order than previous test

    const expected = `${complexString2}\n${complexString1}`;
    expect(MergeUsers(usersMap)).toBe(expected);
  });

});