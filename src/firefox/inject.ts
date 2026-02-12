import { InjectHandler } from "../shared/inject";
import FirefoxStorageHandler from "./firefoxStorageHandler";

class FirefoxInjectHandler extends InjectHandler {
  constructor() {
    super(new FirefoxStorageHandler());
    console.log("FirefoxInjectHandler initialized");
    this.injectStyles();
  }
}

new FirefoxInjectHandler();
