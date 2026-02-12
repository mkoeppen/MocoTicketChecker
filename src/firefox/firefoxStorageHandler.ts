import {
  PROJECT_STORAGE_KEY,
  StorageHandler,
  TProjectsFromStorage,
} from "../shared/inject";

export default class FirefoxStorageHandler extends StorageHandler {
  constructor() {
    super();
  }
  async loadProjects() {
    this.projects =
      (await browser.storage.local.get(PROJECT_STORAGE_KEY))?.projects || {};
  }
  async saveProjects() {
    try {
      const objToSave: { [key: string]: TProjectsFromStorage } = {};
      objToSave[PROJECT_STORAGE_KEY] = this.projects;
      await browser.storage.local.set(objToSave);
    } catch (e) {
      console.log("ERROR", e);
    }
  }
}
