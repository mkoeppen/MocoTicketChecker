// (function () {
//   let projectsFromStorage = {};

//   chrome.storage.sync.get({ projects: {} }, (items) => {
//     projectsFromStorage = items.projects;
//   });

//   function acceptTicketCode(ticketCode, mocoCode) {
//     return new Promise((res) => {
//       try {
//         chrome.storage.sync.get({ projects: {} }, (items) => {
//           const allProjects = items.projects;
//           const currentList = allProjects[mocoCode] || [];
//           allProjects[mocoCode] = [...currentList, ticketCode];
//           projectsFromStorage = allProjects;
//           chrome.storage.sync.set({ projects: allProjects }, () => {
//             res();
//           });
//         });
//       } catch (e) {
//         console.log("ERROR", e);
//       }
//     });
//   }

//   function handlePaste() {
//     document.body.addEventListener("paste", (event) => {
//       const target = event.target;
//       if (
//         !target ||
//         target.tagName !== "TEXTAREA" ||
//         !target.classList.contains("description")
//       )
//         return;
//       event.stopPropagation();
//       event.preventDefault();

//       let paste = (event.clipboardData || window.clipboardData).getData("text");

//       paste = paste.replace(/\s+/g, " ").trim();
//       paste = paste.replace(/^([A-Z]+-\d+)\s+\d+\s+(.*)$/i, "$1 $2");

//       console.log("Set Paste:", paste);

//       // Cursor- und Markierungsposition
//       const start = target.selectionStart;
//       const end = target.selectionEnd;
//       const value = target.value;

//       // Text an Cursor/Markierung einfügen
//       target.value = value.slice(0, start) + paste + value.slice(end);

//       // Cursor hinter den eingefügten Text setzen
//       const newPos = start + paste.length;
//       target.setSelectionRange(newPos, newPos);

//       // Change-Event auslösen
//       const changeEvent = new Event("input", { bubbles: true });
//       target.dispatchEvent(changeEvent);
//     });
//   }

// })();

type THtmlElementWithMocoItem = HTMLElement & { mocoItem?: MocoItem };
export const PROJECT_STORAGE_KEY = "projects";

export type TProjectsFromStorage = {
  [mocoProjectName: string]: string[];
};

export abstract class StorageHandler {
  projects: TProjectsFromStorage = {};

  constructor() {}

  async init() {
    await this.loadProjects();
  }

  getProjects() {
    return this.projects;
  }

  async setProjects(projects: TProjectsFromStorage) {
    this.projects = projects;
    await this.saveProjects();
  }

  getAvailableTicketPrefixes(mocoProjectName: string) {
    return this.projects[mocoProjectName] || [];
  }

  async acceptTicketPrefixForProject(
    ticketCode: string,
    mocoProjectName: string,
  ) {
    const currentList = this.projects[mocoProjectName] || [];
    this.projects[mocoProjectName] = [...currentList, ticketCode];
    await this.saveProjects();
  }

  abstract loadProjects(): Promise<void>;
  abstract saveProjects(): Promise<void>;
}

class MocoItem {
  element: THtmlElementWithMocoItem;
  prefix: string | false = false;
  projectName: string | null = null;
  storageHandler: StorageHandler;

  constructor(
    element: THtmlElementWithMocoItem,
    storageHandler: StorageHandler,
  ) {
    this.element = element;
    this.storageHandler = storageHandler;

    if (element.mocoItem) return;
    element.mocoItem = this;
    this.check();
  }
  check() {
    this.prefix = this.getTicketNumberPrefix();
    this.projectName = this.getMocoProjectName();

    if (!this.prefix) {
      this.element.dataset.ticketCheck = "unknown";
    } else if (this.hasAcceptedPrefix()) {
      this.element.dataset.ticketCheck = "success";
    } else {
      this.element.dataset.ticketCheck = "error";
      this.addAllowQuestion();
    }
  }
  getTicketNumberPrefix() {
    const ticketNumberMatch = (
      this.element.querySelector<THtmlElementWithMocoItem>(
        ".activity-row td:nth-child(3)",
      )?.innerText || ""
    )
      .replace(/\n/, " ")
      .trim()
      .match(/[a-zA-Z0-9]+\-[0-9]+/);
    return ticketNumberMatch ? ticketNumberMatch[0].split("-")[0] : false;
  }
  getMocoProjectName() {
    const itemLabel = (
      this.element.querySelector<THtmlElementWithMocoItem>(
        ".project-name, .tst-project-name",
      )?.nextSibling?.nextSibling as HTMLElement
    )?.innerText;
    const match = itemLabel.match(/P[0-9]+/);
    return match && match.length > 0 ? match[0] : itemLabel;
  }
  hasAcceptedPrefix() {
    if (!this.projectName || !this.prefix) return false;

    const availablePrefixes =
      this.storageHandler.getAvailableTicketPrefixes(this.projectName) || [];
    return availablePrefixes.includes(this.prefix);
  }
  addAllowQuestion() {
    const entryDetailsElement =
      this.element.querySelector<THtmlElementWithMocoItem>(
        ".project-name, .tst-project-name",
      )?.parentElement;
    const wrapper = document.createElement("div");

    if (!entryDetailsElement || this.prefix === false) return;

    const oldWrapper = entryDetailsElement?.querySelector(
      ".m-allow-question__wrapper",
    );
    if (oldWrapper) oldWrapper.remove();

    wrapper.classList.add("m-allow-question__wrapper");
    wrapper.innerHTML = `
                <p>Accept Ticket Prefix <strong>"${this.prefix}"</strong> for Moco Project <strong>"${this.projectName}"</strong></p>
                <button class="m-allow-button">Accept</button>
            `;

    entryDetailsElement.append(wrapper);

    wrapper.querySelector("button")!.addEventListener("click", async () => {
      if (!this.projectName || !this.prefix) return;

      await this.storageHandler.acceptTicketPrefixForProject(
        this.prefix,
        this.projectName,
      );

      const items = document.querySelectorAll<THtmlElementWithMocoItem>(
        ".tst-activities tbody tr",
      );
      items.forEach((item) => {
        item.querySelector(".m-allow-question__wrapper")?.remove();
        item.mocoItem?.check();
      });
    });
  }
}

export abstract class InjectHandler {
  storageHandler: StorageHandler;
  constructor(storageHandler: StorageHandler) {
    this.storageHandler = storageHandler;
    this.injectStyles();
    this.initInjectHandler();
  }

  checkItems() {
    const items =
      document.querySelectorAll<THtmlElementWithMocoItem>(".activity-row");

    items.forEach((item) => {
      new MocoItem(item, this.storageHandler);
      if (
        item.dataset.ticketCheck === "error" &&
        typeof item.mocoItem !== "undefined" &&
        !item.querySelector(".m-allow-question__wrapper")
      ) {
        item.mocoItem.addAllowQuestion();
      }
    });
  }

  handlePaste() {}

  initInjectHandler() {
    if (!document.querySelector(".tst-activities tbody tr")) {
      console.log("Moco Ticket Checker - Wait for Moco");
      setTimeout(() => this.initInjectHandler(), 100);
      return;
    }

    const targetNode = document.querySelector(".tst-activities tbody")!;
    const config = { childList: true, subtree: true };

    this.checkItems();

    const callback: MutationCallback = (mutationList, observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList") {
          this.checkItems();
        }
      }
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    this.handlePaste();
  }

  injectStyles() {
    const styles = document.createElement("style");
    styles.innerHTML = `
    tr[data-ticket-check="success"] {
        background-color: #f1fff7;
        box-shadow: inset 8px 0 0 0 #188433;
    }
    tr[data-ticket-check="error"] {
        background-color: #fff1f1;
        box-shadow: inset 8px 0 0 0 #ff6060;
    }
    tr[data-ticket-check="unknown"] {
        background-color: #fefff1;
        box-shadow: inset 8px 0 0 0 #ffc660;
    }

    tr[data-ticket-check] > td:first-child {
        padding-left: 20px;
    }

    .m-allow-question__wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        border-radius: 4px;
        margin-top: 16px;
        background: #ff6060;
        color: white;
    }

    .m-allow-question__wrapper p {
        padding: 16px 16px;
        margin: 0;
    }

    .m-allow-question__wrapper button {
        margin-right: 16px;
    }

    .m-allow-button {
        font-family: Roboto,Helvetica Neue,Helvetica,Arial,sans-serif;
        font-weight: bold;
        background: white;
        letter-spacing: 1px;
        border-radius: 4px;
        margin-top: 4px;
        display: inline-flex;
        font-size: 14px;
        color: black;
        padding: 4px 12px;
        border: 0;
    }

    /* START STOP BUTTON STYLING */
    .timer {
        font-family: Roboto,Helvetica Neue,Helvetica,Arial,sans-serif;
        font-weight: bold;
        background: white;
        letter-spacing: 1px;
        border: 2px solid currentColor;
        padding: 6px 12px;
        border-radius: 4px;
        margin-top: 4px;
        display: inline-flex;
        font-size: 14px;
    }
    .timer::after {
        font-family: Font Awesome\\ 6 Pro;
        font-weight: 900;
        -webkit-font-smoothing: antialiased;
        display: var(--fa-display,inline-block);
        font-style: normal;
        font-variant: normal;
        line-height: 1;
        text-rendering: auto;
        margin-left: 8px;
    }
    .fa-grey.timer {
        color: #434343;
    }
    .fa-grey.timer::before {
        content: 'Start';
    }
    .fa-red.timer::before {
        content: 'Stop';
    }
    .fa-grey.timer::after {
        content: "\\f04b";
    }
    .fa-red.timer::after {
        content: "\\f04c";
    }

    `;
    document.head.append(styles);
    console.log("Injected styles");
  }
}
