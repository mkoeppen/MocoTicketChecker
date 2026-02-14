import { StorageHandler } from "~/utils/storage";

class PopupHandler {
  ticketPrefixTable: HTMLTableSectionElement;

  constructor() {
    const ticketPrefixTable = document.querySelector<HTMLTableSectionElement>(
      ".m-ticket-prefix-options tbody",
    );
    console.log("[debug] open popup");

    if (!ticketPrefixTable) {
      throw new Error("Could not find ticketPrefixTable element");
    }

    this.ticketPrefixTable = ticketPrefixTable;
    this.init();
  }

  addRow() {
    const row = document.createElement("tr");
    row.innerHTML = this.rowTemplate("", []);
    this.ticketPrefixTable.append(row);
  }

  save() {
    const projects: { [key: string]: string[] } = {};
    this.ticketPrefixTable.querySelectorAll("tr").forEach((row) => {
      const mocoName = row.querySelector<HTMLInputElement>(
        '[name="mocoProjectName"]',
      )?.value;
      const allowedTicketPrefixes = row.querySelector<HTMLInputElement>(
        '[name="allowedTicketPrefixes"]',
      )?.value;

      if (mocoName === undefined || allowedTicketPrefixes === undefined) {
        return;
      }

      projects[mocoName.trim()] = allowedTicketPrefixes
        .split(",")
        .map((p) => p.trim());
    });

    StorageHandler.saveProjects(projects).then(() => {
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      if (status) {
        status.textContent = "Options saved.";
        setTimeout(() => {
          status.textContent = "";
        }, 750);
      }
    });
  }

  async init() {
    console.log("Initializing popup");
    this.initEvents();
    this.restoreOptions();
  }

  initEvents() {
    document
      .querySelector(".m-ticket-prefix-options__add-button")
      ?.addEventListener("click", () => {
        this.addRow();
      });

    document.body.addEventListener("click", (e: MouseEvent) => {
      if (
        (e.target as HTMLElement)
          .closest("button")
          ?.classList?.contains("m-moco-project-remove")
      ) {
        (e.target as HTMLElement).closest("tr")?.remove();
      }
    });

    document
      .getElementById("cancel")
      ?.addEventListener("click", () => this.restoreOptions());

    document.getElementById("options")?.addEventListener("submit", (e) => {
      e.preventDefault();

      this.save();
    });
  }

  async restoreOptions() {
    this.ticketPrefixTable.innerHTML = "";
    const projects = await StorageHandler.loadProjects();
    Object.entries(projects).forEach(
      ([mocoProjectName, allowedTicketPrefixes]) => {
        const row = document.createElement("tr");
        row.innerHTML = this.rowTemplate(
          mocoProjectName,
          allowedTicketPrefixes,
        );
        this.ticketPrefixTable.append(row);
      },
    );
  }

  rowTemplate(
    mocoProjectName: string = "",
    allowedTicketPrefixes: string[] = [],
  ) {
    console.log(
      "Generating row template for",
      mocoProjectName,
      allowedTicketPrefixes,
    );
    return `<td><input name="mocoProjectName" type="text" required value="${mocoProjectName}"></td>
            <td><input name="allowedTicketPrefixes" type="text" required value="${allowedTicketPrefixes.join(",")}"></td>
            <td><button type="button" class="m-moco-project-remove" title="Remove">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -256 1792 1792"><path d="M512 800V224q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v576q0 14 9 23t23 9h64q14 0 23-9t9-23zm256 0V224q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v576q0 14 9 23t23 9h64q14 0 23-9t9-23zm256 0V224q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v576q0 14 9 23t23 9h64q14 0 23-9t9-23zm128-724v948H256V76q0-22 7-40.5t14.5-27Q285 0 288 0h832q3 0 10.5 8.5t14.5 27q7 18.5 7 40.5zM480 1152h448l-48 117q-7 9-17 11H546q-10-2-17-11zm928-32v-64q0-14-9-23t-23-9h-96V76q0-83-47-143.5T1120-128H288q-66 0-113 58.5T128 72v952H32q-14 0-23 9t-9 23v64q0 14 9 23t23 9h309l70 167q15 37 54 63t79 26h320q40 0 79-26t54-63l70-167h309q14 0 23-9t9-23z" style="fill:currentColor" transform="matrix(1 0 0 -1 197.424 1255.05)"/></svg>
            </button></td>`;
  }
}

new PopupHandler();
