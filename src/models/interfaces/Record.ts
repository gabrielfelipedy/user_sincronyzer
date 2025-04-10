export interface Record {
    clock_id: number;
    cpf: string;
    operation: string;
    timestamp: Date; // Use Date object for easy comparison
    nsr: number;
    fullAfdString: string;
  }