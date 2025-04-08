import { User } from "../models/interfaces/User.js";

export const mergeClockData = (
  data: (User[] | undefined)[] | undefined
): User[] | undefined => {
  if (!data || data.length === 0) return [];

  const mergedMap = new Map<string, User>();

  for (const singleData of data) {
    if (!singleData || singleData.length === 0) {
      continue;
    }

    for (const user of singleData) {
      if (user && user.cpf) {
        if (!mergedMap.has(user.cpf)) {
          mergedMap.set(user.cpf, { ...user });
        } else {
          console.log("User already exists");
        }
      } else {
        console.log("Invalid user");
      }
    }
  }

  return Array.from(mergedMap.values());
};
