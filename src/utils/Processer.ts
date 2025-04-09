export async function processLine(linha: string) {
  //TRATA AS QUEBRAS DE LINHA
  linha = linha.replace(/\r\n/g, "\n").trim();

  try {
    const tipoRegistro = linha.substring(9, 10);

    if (tipoRegistro !== "5") {
      return null;
    }

    //   const regist = linha.substring(0, 46).trim()
    //   const crc = linha.substring(46).trim()

    //   //remove extra zero in middle of string
    //   const line  = `${regist.slice(0, 34) + regist.slice(35)} ${crc}`

    return linha;
  } catch (error) {
    console.error("Erro ao interpretar registro:", error, linha);
    return null;
  }
}
