import { AFD } from "../models/interfaces/AFD.js";
import { AFDProcessed } from "../models/interfaces/AFDProcessed.js";
import { Record } from "../models/interfaces/Record.js";



export function parseCsv(csvString: string): { header: string | undefined; lines: string[] }  {
  const allLines = csvString.trim().split(/\r?\n/); // Split by newline, handle \r\n and \n
  const header = allLines.length > 0 ? allLines[0] : '';
  const lines = allLines.length > 1 ? allLines.slice(1) : [];
  return { header, lines}
}


export function getCpfFromCsvLine(line: string, separator = ';'): number | null {
  if (!line) return null;
  const columns = line.split(separator);

  if(!columns || !columns[0]) return null

  return columns.length > 0 ? Number(columns[0].trim()) : null;
}


// function escapeCsvValue(value: any): string {
//   if (value === null || value === undefined) {
//     return ""; // Represent null/undefined as empty string
//   }

//   const stringValue = String(value); // Convert boolean, number, etc., to string

//   // Check if quoting is needed (contains delimiter, quote, or newline)
//   if (/[";\n]/.test(stringValue)) {
//     // Escape internal double quotes by doubling them
//     const escapedValue = stringValue.replace(/"/g, '""');
//     // Wrap the entire value in double quotes
//     return `"${escapedValue}"`;
//   }

//   // No special characters, return as is
//   return stringValue;
// }

export function parseAFDString(afdString: string, clock_id: number): Record | null {
  const timestampStart = 10;
  const timestampEnd = 34;
  const cpfStart = 36;
  const cpfEnd = 47;
  const nsrStart = 0;
  const nsrEnd = 9;
  const opStart = 34;
  const opEnd = 35;

  if(afdString.length < cpfEnd)
  {
    console.log('Invalid string afd')
    return null
  }

  const timestampStr = afdString.substring(timestampStart, timestampEnd);
  const cpf = Number(afdString.substring(cpfStart, cpfEnd));
  const operation = afdString.substring(opStart, opEnd);
  const nsr = Number(afdString.substring(nsrStart, nsrEnd))

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
    nsr,
    fullAfdString: afdString,
  };
}


// SE FOR EVENTO DE EXCLUSÃO DE USUÁRIO - EXCLUIR USUÁRIO DO CSV
// SE FOR EVENTO DE INSERÇÃO OU ALTERAÇÃO - SUBSTITUI USUÁRIO DO CSV

export function parseDuplicatedData(data: AFD[])
{
    const latestEntriesByCpf = new Map<number, Record>();

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

    return latestEntriesByCpf

    // const groupedByClockId = new Map<number, Record[]>

    // for(const record of Array.from(latestEntriesByCpf.values()))
    // {
    //   const key = record.clock_id

    //   if(groupedByClockId.has(key))
    //   {
    //     groupedByClockId.get(key)?.push(record)
    //   }
    //   else
    //   {
    //     groupedByClockId.set(key, [record])
    //   }
    // }

 
    // const result: AFDProcessed[] = Array.from(groupedByClockId.entries()).map(([clockId, records]) => {
     
    //   const sortedRecords = records.sort((a, b) => a.nsr - b.nsr); 
  
    //   return {
    //     clock_id: clockId,
    //     afd: sortedRecords
    //   };
    // });
  
    // return result;
}



// export const usersToCSV = (users: User[] | undefined) => {
//   if (!users || users.length === 0) {
//     return "";
//   }

//   const headers: (keyof User)[] = [
//     "cpf",
//     "nome",
//     "administrador",
//     "matricula",
//     "rfid",
//     "codigo",
//     "senha",
//     "barras",
//     "digitais",
//   ];

//   const headerString = headers.join(";");

//   const dataRows = users.map((user) => {
//     const rowValues = headers.map((header) => {
//       const value = user[header];

//       return escapeCsvValue(value);
//     });

//     return rowValues.join(";");
//   });

//   return [headerString, ...dataRows].join("\r\n");
// };
