import browser from "webextension-polyfill";
import { PROJECT_STORAGE_KEY } from "./config";

export const StorageHandler = {
  loadProjects: async () => {
    const projects = await browser.storage.local.get(PROJECT_STORAGE_KEY);

    if (!projects[PROJECT_STORAGE_KEY]) {
      return {} as TProjectsFromStorage;
    }

    return projects[PROJECT_STORAGE_KEY] as TProjectsFromStorage;
  },
  getAvailableTicketPrefixes: async (mocoProjectName: string) => {
    const projects = await StorageHandler.loadProjects();
    return projects[mocoProjectName] || [];
  },
  saveProjects: async (projects: TProjectsFromStorage) => {
    await browser.storage.local.set({ [PROJECT_STORAGE_KEY]: projects });
  },
  acceptTicketPrefixForProject: async (
    ticketCode: string,
    mocoProjectName: string,
  ) => {
    const projects = await StorageHandler.loadProjects();
    const currentList = projects[mocoProjectName] || [];
    projects[mocoProjectName] = [...currentList, ticketCode];
    await StorageHandler.saveProjects(projects);
  },
};
