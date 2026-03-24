import { defineBackground } from "wxt/utils/define-background";
import { initBackground } from "../Background/service-worker";

export default defineBackground(() => {
  void initBackground();
});
