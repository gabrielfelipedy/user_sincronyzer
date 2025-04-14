import fs from "fs";
import iconv from "iconv-lite";

import axios, { AxiosResponse, AxiosError } from "axios";
import { Clock } from "../models/interfaces/Clock.js";
import { processLine } from "../utils/Processer.js";
import { Record } from "../models/interfaces/Record.js";
import { NSR } from "../models/interfaces/NSR.js";

export const WriteClockUsers = async (
  users: string,
  clock: Clock,
  session: string
) => {
  if (!users || !clock || !session) return "";

  try {
    const config = {
      headers: {
        "content-Type": "application/octet-stream",
        "content-Length": new TextEncoder().encode(users).length,
      },
    };

    const response: AxiosResponse = await axios.post(
      `https:${clock.ip}/import_users_csv.fcgi?session=${session}&mode=671`,
      users,
      config
    );

    console.log("CSV uploaded sucessfully");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export async function getAllClocks() {
  try {
    const raw_clocks = fs.readFileSync("./clocks.json", "utf-8");
    const clocks = JSON.parse(raw_clocks);

    return clocks;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("Arquivo clocks.json não encontrado");
    } else if (error instanceof SyntaxError) {
      console.error("Erro ao analisar clocks.json:", error);
    } else {
      console.error("Erro inesperado ao ler clocks.json:", error);
    }

    return null;
  }
}

export async function getLastNSR() {
  try {
    const nsrFileContent = fs.readFileSync("./nsr.json", "utf-8");
    const dadosLidos = JSON.parse(nsrFileContent);

    return dadosLidos;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("Arquivo nsr.json não encontrado. Iniciando com NSR 1.");
    } else if (error instanceof SyntaxError) {
      console.error("Erro ao analisar nsr.json:", error);
    } else {
      console.error("Erro inesperado ao ler nsr.json:", error);
    }

    return 0;
  }
}

export async function getAfdByInitialNSR(
  session: string,
  clock: Clock,
  initial_nsr: number
) {
  //console.log("initial NSR recebido ", initial_nsr)

  let buffer = Buffer.from("");
  let registros = [];

  console.log(`\nInitial NSR: ${initial_nsr}`);

  //PREPARA A URL PARA OBTER O AFD
  const url = new URL(`https://${clock.ip}/get_afd.fcgi`);
  url.searchParams.append("session", session);
  url.searchParams.append("mode", "671");

  try {
    //OBTÉM O AFD A PARTIR DO NSR INICIAL
    const response = await axios.post(url.toString(), {
      initial_nsr: initial_nsr,
    });

    //SALVA EM BUFFER PARA PROCESSAR
    let decodedRes = iconv.decode(
      Buffer.concat([buffer, Buffer.from(response.data)]),
      "win1252"
    );

    //SE OBTEVE RESPOSTA
    if (decodedRes) {
      console.log("\n\nNovos registros encontrados. Processando...");

      //SEPARA AS LINHAS
      const separated = decodedRes.split("\n");

      const linhas = separated.slice(0, -2);

      // console.log("\nDados recebidos: ")
      // console.log(linhas)

      // //A ULTIMA LINHA SEMPRE É O NOME DO ARQUIVO, SALVA OS DADOS BRUTOS
      // const fileName = linhas[linhas.length - 1];
      // fs.writeFileSync(`${fileName}`, response.data, null, 2);
      // console.log(`AFD salvo em ${fileName}`);

      //PROCESSA CADA LINHA INDIVIDUALMENTE
      for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];

        //SE LINHA FOR VÁLIDA, A INTERPRETA
        if (linha) {
          const registro = await processLine(linha);

          //SE PROCESSAMENTO FOI VÁLIDO
          if (registro) {
            registros.push(registro);
          }
        }
      }

      if (registros.length > 0) {
        console.log("\nRegistros incluídos com sucesso\n");
      } else {
        console.log("Nâo foram localizados novos registros de pontos");
      }

      // conn.disconnect();
    } else {
      console.log("Arquivo AFD em branco");
    }

    return registros;

    // if (response.data !== "") {
    //   fs.writeFileSync(`${fileName}`, response.data, null, 2);
    //   console.log(`Resposta salva em ${fileName}`);
    // }
  } catch (error) {
    console.error(error);

    return null;
  }
}

function SaveNSR(clock_id: number, nsr: number)
{
  try {
    const nsrFileContent = fs.readFileSync("./nsr.json", "utf-8");
    const dadosLidos = JSON.parse(nsrFileContent);

    const clock_to_update = dadosLidos.find(
      (clock: NSR) => clock.clock_id === clock_id
    );

    if (clock_to_update) {
      clock_to_update.last_nsr = nsr;

      //GRAVA OS DADOS INTERPRETADOS
      fs.writeFileSync("nsr.json", JSON.stringify(dadosLidos, null, 2));
      console.log("Dados foram gravados");
    } else {
      console.log("No clock found");
    }
  } catch (error) {
    console.error("Erro ao interpretar registro:", error);
    return null;
  }
}

export const RecordLastNSR = (data: Map<number, Record>) => {
  const latestNSR = new Map<number, number>();

  for (const record of data.values()) {
    if (record) {
      const currentClockID = record.clock_id;
      const currentNSR = record.nsr;

      const existingEntry = latestNSR.get(currentClockID);

      if (!existingEntry || currentNSR > existingEntry) {
        latestNSR.set(currentClockID, currentNSR);

        SaveNSR(currentClockID, currentNSR)
      }
    } else {
      console.log("Invalid inputs");
    }
  }

  return latestNSR;
};