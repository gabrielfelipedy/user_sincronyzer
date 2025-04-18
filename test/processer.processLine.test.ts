import { describe, it, expect, vi, beforeEach } from "vitest";
import { processLine } from "../src/utils/Processer.js";

describe('processLine', () => {

  it('should return correctly a single line processed', () => {
    
    const line = '00000010252025-04-08T12:38:00-0300I080627153291BRUNOSOUZA'
    const processed = processLine(line)
    expect(processed).toBe(line)
  });

  it('should return correctly a single line processed with spaces', () => {
    
    const line = '\n\n00000010252025-04-08T12:38:00-0300I080627153291BRUNOSOUZA  '
    const expected = '00000010252025-04-08T12:38:00-0300I080627153291BRUNOSOUZA'
    const processed = processLine(line)
    expect(processed).toBe(expected)
  });

  it('should return correctly a single line processed with tabs', () => {
    
    const line = '\n\n\t00000010252025-04-08T12:38:00-0300I080627153291BRUNOSOUZA\t\t\t\t\n'
    const expected = '00000010252025-04-08T12:38:00-0300I080627153291BRUNOSOUZA'
    const processed = processLine(line)
    expect(processed).toBe(expected)
  });

  it('should return null when passing a NSR with code different from 5', () => {
    
    const line = '00000010232025-04-08T12:38:00-0300I080627153291BRUNOSOUZA'
    const expected = null
    const processed = processLine(line)
    expect(processed).toBe(expected)
  });

});