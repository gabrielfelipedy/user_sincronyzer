export function processLine(linha: string) {
  //TRATA AS QUEBRAS DE LINHA
  linha = linha.replace(/\r\n/g, "\n").trim();

  try {
    const tipoRegistro = linha.substring(9, 10);

    if (tipoRegistro !== "5") {
      return null;
    }

    return linha;

  } catch (error) {
    console.error("Erro ao interpretar registro:", error, linha);
    return null;
  }
}
