import { AFD } from "../models/interfaces/AFD.js";
import { Record } from "../models/interfaces/Record.js";


//Divides a CSV into header and lines
export function parseCsv(csvString: string): { header: string | undefined; lines: string[] }  {
  const allLines = csvString.trim().split(/\r?\n/); // Split by newline, handle \r\n and \n
  const header = allLines.length > 0 ? allLines[0] : '';
  const lines = allLines.length > 1 ? allLines.slice(1) : [];
  return { header, lines}
}


export function getCpfFromCsvLine(line: string, separator = ';'): number | null {
  if (!line || line.trim() === '') return null; //Verifys if string is null, undefined, empty of just with blank spaces

  const columns = line.split(separator); //split into an array

  if(!columns || !columns[0]?.trim()) return null //if failed spliting or don't have generated any element

  const parsedCPF = Number(columns[0].trim())

  if(isNaN(parsedCPF) || !isFinite(parsedCPF)) return null

  return parsedCPF
}


// TODO: THROW EXCEPTIONS TO KNOW WHAT EXCALTY IS EVERY THING
function isValidateEntries(timestamp: string, cpf: string, op: string, nsr: string)
{
  //verifys if are not passed empty values, null, undefined of NaN
  if(!timestamp || !cpf || !op || !nsr) return false

  //verify if the length of string is correct
  if(!(timestamp.length === 24 && cpf.length === 11 && op.length === 1 && nsr.length === 9)) return false

  //verify if timestamp is valid
  const timestampObj = new Date(timestamp);

  if(isNaN(timestampObj.getTime()))
  {
    //console.log("Invalid timestamp")
    return false
  }

  //verify if operation is valid
  if(!(['A', 'E', 'I'].includes(op))) return false

  return true
}

export function parseAFDString(afdString: string, clock_id: number): Record | null {

  //verifty if clock_id is valid
  if(!isFinite(clock_id) || !clock_id || isNaN(clock_id)) return null 

  const timestampStart = 10;
  const timestampEnd = 34;
  const cpfStart = 36;
  const cpfEnd = 47;
  const nsrStart = 0;
  const nsrEnd = 9;
  const opStart = 34;
  const opEnd = 35;

  if(!afdString || afdString.length < cpfEnd)
  {
    console.log('Invalid string afd')
    return null
  }

  const timestampStr = afdString.substring(timestampStart, timestampEnd).trim();
  const cpf = afdString.substring(cpfStart, cpfEnd).trim();
  const operation = afdString.substring(opStart, opEnd).trim();
  const nsr = afdString.substring(nsrStart, nsrEnd).trim()

  if(!isValidateEntries(timestampStr, cpf, operation, nsr)) return null


  return {
    clock_id,
    cpf: Number(cpf),
    operation,
    timestamp: new Date(timestampStr),
    nsr: Number(nsr),
    fullAfdString: afdString,
  };
}


export function parseDuplicatedData(data: AFD[])
{
    const latestEntriesByCpf = new Map<number, Record>();

    for(const record of data)
    {
        if(!record) continue

        for(const afdString of record.afd)
        {
          if(!afdString) continue

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

}