// src/mergeUsers.test.ts
import { describe, it, expect } from 'vitest';
import { MergeUsers } from '../src/utils/Merger.js';

// --- Test Data ---
// The long example string provided in the prompt
const complexString1 = "83384666215;NOME EXEMPLO 01;0;25656;0;123123;13;;SUNSUzIxAAAJjgMBAAAAAMUAxQAEAUABAAAAgzwdWgAlAI4PVgCEAHkPwACOACgPbACUAH8MfgCUAJUOlwCVACcP1wCbAKIPUQCjAFkNKACuAE0PhwCzAJ0OaAC0ACwMMQC6AEUPzwC+ADEOVQDEAC8OvwDQADYOPADSADIPowDbAEIPfgDlAKsOGADpAEIPhwDrALkOJADtADoPdQDwAKUOpwD+AE0P1gABATwP4wAHAbsPmwAQAVkPXwARAQsOgwARAdEMcAAlAQcNNxcvEyf7If9OIBrnbYvSA4/5Ae2dC24obRntciL43ZaujVYDdX8qcTNvQS8W3O7gWQhiHir3YnCaCLp5uf7x11aQ4fhpF0oZrf4akQcJNQa9/w7YKQa+9J/p/e85B675MgyqiHr17PcxCM5qTAsqExf9YBM9FbJ41PsmCRP1ufzR7Q7VjfbyDcqVVYDL8PcKWYBPc2+HAQ6litajmQd2PU5qrXoRz2ItHf9ZO2uwrlCiDSAvAQHWGFMLAGcNDDfBPlEEAIQOE8DCDABbFgb//cHBwP3B/8H+DABVHBPD/WjC/cBLEAA3LP1AwD5PwUQSACw/6fwrTP9GVz0QAClJ7SPA/8EyTFoQACdT8f4vQEbAVA4AJV/t/iv//lT+wcASABZw6f8xO8E1S0YXAA6C5P8zM/9GRP3C+8L/SQoAUoKAwsLDwob/BABahAb+/A4AUoh3wMR5wsJFfAgAxI8iOEoRAGyQicX/wsPAxMGL/3HEDQCTkZxswYLBwoQJAMCSK8FMRhEAaJV6ecPCln/Awm0FAJuVIMAtDABwlg/8Mv78//84DgCXmStTQMA+IgUA3Zk6xEIDAGibE/4SAEyjacXDjMHBwcLAw8HDxqcJAGulHP/B/P39NQsAUKdan8KAqQkAWatXxMHEwsKWBgBoqyRP/BsABbHPLsD9Lv//+8BEwP1HPSALACeyU8PAwlvDwMIGAF2zScaIBQBks0DEdwQAabgpSgsAL71DhmfBjgYA08EwwEcHAM3CNMFG/wQAVcgwjwgAvNQ3T8DA+wgAw9Q0wDBtBQA91zR3CQCk30PB+sD/+x0GABjtQP+QBgAj8jfAhAUQpgRQwyIDENkFN/8EENMGOv//ABAA";

// A variation based on the second part of the example
const complexString2 = "609572217;GABRIEL SOUZA;1;5774;0;166;183;;+AI4PbQCFAHsPwgCFACkPmACMACYPaACTABcPUACeAFYPKQCnAE0PZACnACcPiwCtAJ4PMgCzAEMP0ACzADEPVwC9ACwPPwDIADIPvADIADUPpgDQAEEPfADfAKsOiwDgALYOeADmAKQOIQDnADoPhQDwAIUO3ADzAEAOqgD2AE0P5QAAAUUO3AAGAb8OYwAJAQoOnQAKAWAPWwAaARQOyQAcAU4PUQAhASAOFf8uYE4kZRUKaFZ4VWT17ZEH0geP+J/38piqiVb/OZyx8dnDPTIZQ2IsWQxeHir6IRHt0rH/snlqen6L5fhpEibtsf8HCLvxKQfF/w7Y+fI9C/rmvfYtB5/oMQ6qjH72LArZ9AEpTQwZMD0VsPr5INHxJgsX+g/vleDJ0KndafyBgZL3je66yc6apIvlBJ76qH+BgSFzyfnS7E5q+RbC3dOs1PdBDU+TEZMWCgYTSA8+GDt/WQmMAiAvAQHcF7cLAHwQGsLARMDAOgQAixATXA4AbBoG/VhEQkwNAGMiDMD//1P+wf9PDgBWLQP+PcE2wFUUAEs0CcBEN0xU//x2AwDaQBb8EwBHQv39wP8+wEpA/l0MADpO9/04wD5RDwA2Vv04/sH9V8AyGQAuZPAoK0bA/v/A/Hb+/cP/RgoAInbnKv7//kIFAFB5esCdEwBYfAP9wfz//j5BR/4jCAB6fJDBjJEHAFGAd4ygDwBohoPEwMGSlsHAZggAxociOMBECwDBiSvBTME2/Q8AnIwgwPzD/ML//sD+wMDA/Q8Al5Anwf3APv9G/v3BAwBtlBP+FgBUm/r8/P7C+/3//MH7+fz7///+//wmEQBMnWfFxP+dwMLCwMPCw8TGCQBgpGfHoMOLBgBophcq/QUAJ6tTkgUAZKs3wcT/BQBesEDGcgYAbLEpwMD8/wcA1LYwXmgGAM63NMH/Uw0AMbhDjP+LiMQEAFnDLYwJAL3LNEb+wfvCBgA/zTR3wQkAp9VA//zA/h0GACXqN2zABwAf60B+lwYAqftMwSQEEO4BQ2UEEOEDRmkEEOcDRmkgEGcICcLEx4TCw8L/wsPCxsCNko3//4nBAxD0DEP/AxAcGzDCAxBdHRfCACAA";

// A variation based on the third part of the example
const complexString3 = "70000484923;HELINGTON;0;13;0;3533;163;;gtYZWACEAHcPgQCLAI4PvwCUACYPbwCYAH0PlQCbACQP4gCcAKQPawCfABcPVACpAFgPZQCzACYPKwC1AE0PjQC4AJ0PNQDBAEMP0wDCADEPWgDJAC4PvgDWADMPQQDXADEPqADeAEEPjQDvALgOIwD0ADkP3gABAT4OrQADAUwP5wARAUMOagASAQkP3wAWAb4OoAAYAVwPKvwyYE4hWRINb1Z4ZoXWB4v1WGrp8lFb+ZuqiOKqZoEudjdzQJ618dnCPTUZQhLc8dElEa36WQxeHir3snhqen6L4fhpFkYWsQMijgMNJQq9/w7YwfYxB5/o/fI9B/rmMRKqiHr1snjibvpfKgsX+g/vbf2BgcP0jfLyDc6WqIbpBcv7W1B/rnO/rH6BgVN1/RLWp6tWiBEkACAmAQGgFn8EAJEWEFoJAIMZF21EwAwAcx4M/cLAPsE2DgBhJgb//sDBNkRKDwBZMv38R8H+wP5owP8TAFE4DGQ2/1VB+8VQDwBDRANEQFPAQBYAPU/9Ni9H/8H+/8D+WzgWADVc9ys+/8D+/8MqW8BQEAAzaPT+MEZE/cE1GQAod+0pM1T+wf7/wPzCVPzDRgYAVIV6wsGYGAAihuQnOy/C/Tb+Vz7ACAB+iZPDgZIOAGyTg8T/ksLCg3AKAMOXJ0pMQg8Ac5kM+y8q//7/+xgPAGuafcLBn8DDwnaFDQCYnCL/QP7BQTwDAG+gE/4WAFin+vv8wMD8/Sn89//5wP7///vA+xEAUKhnxMSAwYDAoMPGCQBgsF7FoMOYBgBosRb+/v/8GAAbs9f+LsH8/v8nwP9D/cA4/QUAZbc0wYMFACq5U8OCBQBgu0PHbgYAbbwnwP/9/wYA0cUxYMAHANfFLUT/wQoANMZGwot8wgQAWs0tjAcAwNg0RkIPAEHcMMHAhcTDxcXCkQUAJ/c3wI4FACH4PcHAwgQQrAlMwf4AREIBAQAAABYAAAAAAgUAAAAAAABFQg==";


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