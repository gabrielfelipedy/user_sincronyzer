import { AFD } from "../models/interfaces/AFD.js";
import { AFDProcessed } from "../models/interfaces/AFDProcessed.js";
import { Record } from "../models/interfaces/Record.js";
import { User } from "../models/interfaces/User.js";

export const parseCSV = (csv: string | null): User[] => {
  if (!csv) return [];

  csv = csv.trim();
  if (!csv) return [];

  const lines = csv.split("\n");
  const line_headers = lines.shift();
  if (!line_headers) return [];

  const headers = line_headers.split(";").map((header) => header.trim());

  const data = lines
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const values = line.split(";").map((value) => value.trim());
      const dataObject = {} as User;

      headers.forEach((header, index) => {
        (dataObject as any)[header] = values[index];
      });

      return dataObject;
    });

  return data;
};

function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return ""; // Represent null/undefined as empty string
  }

  const stringValue = String(value); // Convert boolean, number, etc., to string

  // Check if quoting is needed (contains delimiter, quote, or newline)
  if (/[";\n]/.test(stringValue)) {
    // Escape internal double quotes by doubling them
    const escapedValue = stringValue.replace(/"/g, '""');
    // Wrap the entire value in double quotes
    return `"${escapedValue}"`;
  }

  // No special characters, return as is
  return stringValue;
}

export function parseAFDString(afdString: string, clock_id: number): Record | null {
  const timestampStart = 10;
  const timestampEnd = 34;
  const cpfStart = 36;
  const cpfEnd = 47;

  if(afdString.length < cpfEnd)
  {
    console.log('Invalid string afd')
    return null
  }

  const timestampStr = afdString.substring(timestampStart, timestampEnd);
  const cpf = afdString.substring(cpfStart, cpfEnd);
  const operation = afdString.substring(34, 35);

  const timestamp = new Date(timestampStr);
  if(isNaN(timestamp.getTime()))
  {
    console.log("Invalid timestamp")
    return null
  }


  return {
    clock_id,
    cpf,
    operation,
    timestamp,
    fullAfdString: afdString,
  };
}


// SE FOR EVENTO DE EXCLUSÃO DE USUÁRIO - EXCLUIR USUÁRIO DO CSV
// SE FOR EVENTO DE INSERÇÃO OU ALTERAÇÃO - SUBSTITUI USUÁRIO DO CSV

export function parseDuplicatedData(data: AFD[])
{
    const latestEntriesByCpf = new Map<string, Record>();

    for(const record of data)
    {
        for(const afdString of record.afd)
        {
            const parsedRecord = parseAFDString(afdString, record.clock_id)

            if(parsedRecord)
            {
                const existingEntry = latestEntriesByCpf.get(parsedRecord.cpf)

                if(!existingEntry || parsedRecord.timestamp > existingEntry.timestamp)
                {
                    latestEntriesByCpf.set(parsedRecord.cpf, parsedRecord)
                }
            }
        }
    }

    return Array.from(latestEntriesByCpf.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}



export const usersToCSV = (users: User[] | undefined) => {
  if (!users || users.length === 0) {
    return "";
  }

  const headers: (keyof User)[] = [
    "cpf",
    "nome",
    "administrador",
    "matricula",
    "rfid",
    "codigo",
    "senha",
    "barras",
    "digitais",
  ];

  const headerString = headers.join(";");

  const dataRows = users.map((user) => {
    const rowValues = headers.map((header) => {
      const value = user[header];

      return escapeCsvValue(value);
    });

    return rowValues.join(";");
  });

  return [headerString, ...dataRows].join("\r\n");
};
