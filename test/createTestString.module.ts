export type CreateTestStringParams = {
  nsr?: string;
  timestamp?: string;
  operation?: string;
  cpf?: string;
  extra?: string;
};

export const createTestString = ({
  nsr = "000000102",
  timestamp = "2025-04-08T12:38:00-0300",
  operation = "I",
  cpf = "80627000000",
  extra = "JIMMY ANDERSON COSTA DA TRINDADE                    10000000001621591ea",
}: CreateTestStringParams = {}): string => {
  const complete_string = `${nsr}5${timestamp}${operation}0${cpf}${extra}`;

  return complete_string;
};
