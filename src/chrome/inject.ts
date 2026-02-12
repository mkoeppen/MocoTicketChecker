import {
  InjectHandler,
  PROJECT_STORAGE_KEY,
  StorageHandler,
  TProjectsFromStorage,
} from "../shared/inject";

class ChromeStorageHandler extends StorageHandler {
  constructor() {
    super();
  }
  async loadProjects() {
    this.projects =
      (await chrome.storage.local.get<TProjectsFromStorage>([
        PROJECT_STORAGE_KEY,
      ])) || {};
  }
  async saveProjects() {
    try {
      const objToSave: { [key: string]: TProjectsFromStorage } = {};
      objToSave[PROJECT_STORAGE_KEY] = this.projects;
      await chrome.storage.local.set(objToSave);
    } catch (e) {
      console.log("ERROR", e);
    }
  }
}

class FirefoxInjectHandler extends InjectHandler {
  constructor() {
    super(new ChromeStorageHandler());
    console.log("FirefoxInjectHandler initialized");
  }
}

new FirefoxInjectHandler();
