import { Record } from "./Record.js";

export interface AFDProcessed {
    clock_id: number;
    afd: Record[];
}