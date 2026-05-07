import { initialData } from "../data/initialData";

const STORAGE_KEY = "soundsphere_mvp_data";

export function hashPassword(password) {
  let hash = 0;

  for (let index = 0; index < password.length; index++) {
    const character = password.charCodeAt(index);
    hash = (hash << 5) - hash + character;
    hash = hash & hash;
  }

  return `hashed_${Math.abs(hash)}`;
}

function normalizeData(data) {
  return {
    ...data,
    users: data.users.map((user) => {
      if (user.passwordHash) {
        return user;
      }

      return {
        ...user,
        passwordHash: hashPassword(user.password),
        password: undefined,
      };
    }),
  };
}

export function loadData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      const normalizedInitialData = normalizeData(initialData);
      saveData(normalizedInitialData);
      return normalizedInitialData;
    }

    return normalizeData(JSON.parse(savedData));
  } catch (error) {
    console.error("Failed to load saved data:", error);
    return normalizeData(initialData);
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data:", error);
  }
}