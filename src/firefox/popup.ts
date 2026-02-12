import { PopupHandler } from "../shared/popup";
import FirefoxStorageHandler from "./firefoxStorageHandler";

class FirefoxPopupHandler extends PopupHandler {
  constructor() {
    super(new FirefoxStorageHandler());
    console.log("FirefoxPopupHandler initialized");
  }
}

new FirefoxPopupHandler();
