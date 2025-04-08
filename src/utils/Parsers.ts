import { User } from "../models/interfaces/User.js"

export const parseCSV = (csv: string | null): User[] => {
    if(!csv) return []

    csv = csv.trim()
    if(!csv) return []

    const lines = csv.split('\n')
    const line_headers = lines.shift()
    if(!line_headers) return []

    const headers = line_headers.split(';').map(header => header.trim())

    const data = lines
    .filter(line => line.trim() !== '')
    .map(line => {

        const values = line.split(';').map(value => value.trim())
        const dataObject = {} as User

        headers.forEach((header, index) => {
            (dataObject as any)[header] = values[index]
        })

        return dataObject
    })

    return data
}

function escapeCsvValue(value: any): string {
    if (value === null || value === undefined) {
        return ''; // Represent null/undefined as empty string
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

export const usersToCSV = (users: User[] | undefined) => {

    if(!users || users.length === 0)
    {
        return ''
    }

    const headers: (keyof User)[] = [
        'cpf',
        'nome',
        'administrador',
        'matricula',
        'rfid',
        'codigo',
        'senha',
        'barras',
        'digitais'
    ]

    const headerString = headers.join(';')

    const dataRows = users.map(user => {
        const rowValues = headers.map(header => {
            const value = user[header]

            return escapeCsvValue(value)
        })

        return rowValues.join(';')
    })

    return [headerString, ...dataRows].join('\r\n')
}