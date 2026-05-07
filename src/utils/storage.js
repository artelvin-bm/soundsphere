import { initialData } from "../data/initialData";

const STORAGE_KEY = "soundsphere_mvp_data";

export function loadData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      return initialData;
    }

    return JSON.parse(savedData);
  } catch (error) {
    console.error("Failed to load saved data:", error);
    return initialData;
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data:", error);
  }
}