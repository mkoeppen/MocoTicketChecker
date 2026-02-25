import { StorageHandler } from "~/utils/storage";

type THtmlElementWithMocoItem = HTMLElement & { mocoItem?: MocoItem };

export type TProjectsFromStorage = {
  [mocoProjectName: string]: string[];
};

class MocoItem {
  element: THtmlElementWithMocoItem;
  prefix: string | false = false;
  projectName: string | null = null;

  constructor(element: THtmlElementWithMocoItem) {
    this.element = element;

    if (element.mocoItem) return;
    element.mocoItem = this;
    this.check();
  }
  async check() {
    this.prefix = this.getTicketNumberPrefix();
    this.projectName = this.getMocoProjectName();

    if (!this.prefix) {
      this.element.dataset.ticketCheck = "unknown";
    } else if (await this.hasAcceptedPrefix()) {
      this.element.dataset.ticketCheck = "success";
    } else {
      this.element.dataset.ticketCheck = "error";
      await this.addAllowQuestion();
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

    if (!itemLabel) return "unknown";
    const match = itemLabel.match(/P[0-9]+/);

    return match && match.length > 0 ? match[0] : itemLabel;
  }
  async hasAcceptedPrefix() {
    if (!this.projectName || !this.prefix) return false;

    const availablePrefixes =
      (await StorageHandler.getAvailableTicketPrefixes(this.projectName)) || [];
    return availablePrefixes.includes(this.prefix);
  }
  async addAllowQuestion() {
    const entryDetailsElement =
      this.element.querySelector<THtmlElementWithMocoItem>(
        ".project-name, .tst-project-name",
      )?.parentElement;
    const wrapper = document.createElement("div");

    if (!entryDetailsElement || this.prefix === false) return;

    const oldWrapper = entryDetailsElement?.querySelector(
      ".mtc-allow-question__wrapper",
    );
    if (oldWrapper) oldWrapper.remove();

    wrapper.classList.add("mtc-allow-question__wrapper");

    const p = document.createElement("p");
    p.append(
      document.createTextNode("Ticket-Präfix "),
      (() => {
        const s = document.createElement("strong");
        s.textContent = `\"${this.prefix}\"`;
        return s;
      })(),
      document.createTextNode(" für Moco-Projekt "),
      (() => {
        const s = document.createElement("strong");
        s.textContent = `\"${this.projectName}\"`;
        return s;
      })(),
      document.createTextNode(" akzeptieren?"),
    );

    const button = document.createElement("button");
    button.className = "mtc-allow-button";
    button.textContent = "Akzeptieren";

    wrapper.append(p, button);

    entryDetailsElement.append(wrapper);

    wrapper
      .querySelector(".mtc-allow-button")!
      .addEventListener("click", async () => {
        if (!this.projectName || !this.prefix) return;

        await StorageHandler.acceptTicketPrefixForProject(
          this.prefix,
          this.projectName,
        );

        const items = document.querySelectorAll<THtmlElementWithMocoItem>(
          ".tst-activities tbody tr",
        );
        items.forEach(async (item) => {
          await item.mocoItem?.check();
          item.querySelector(".mtc-allow-question__wrapper")?.remove();
        });
      });
  }
}

class InjectHandler {
  constructor() {
    this.initInjectHandler();
  }

  checkItems() {
    const items =
      document.querySelectorAll<THtmlElementWithMocoItem>(".activity-row");

    items.forEach((item) => {
      new MocoItem(item);
      if (
        item.dataset.ticketCheck === "error" &&
        typeof item.mocoItem !== "undefined" &&
        !item.querySelector(".mtc-allow-question__wrapper")
      ) {
        item.mocoItem.addAllowQuestion();
      }
    });
  }

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
  }
}

new InjectHandler();
