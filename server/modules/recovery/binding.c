#include <stdlib.h>
#include <stdio.h>
#include <shadow-node/iotjs.h>
#include <shadow-node/iotjs_def.h>
#include <shadow-node/iotjs_binding.h>
#include <recovery/recovery.h>

#define UPGRADE_OTA_PATH "/data/upgrade/upgrade.img"

JS_FUNCTION(VerifyImage) {
  return jerry_create_boolean(true);
}

JS_FUNCTION(PrepareImage) {
  struct boot_cmd cmd;
  memset(&cmd, 0, sizeof(cmd));
  strncpy(cmd.boot_mode, BOOTMODE_RECOVERY, strlen(BOOTMODE_RECOVERY));
  strncpy(cmd.recovery_path, UPGRADE_OTA_PATH, strlen(UPGRADE_OTA_PATH));
  strncpy(cmd.recovery_state, BOOTSTATE_READY, strlen(BOOTSTATE_READY));
  set_recovery_cmd_status(&cmd);
  return jerry_create_boolean(true);
}

JS_FUNCTION(UpgradeImage) {
  system("reboot");
  return jerry_create_boolean(true);
}

void init(jerry_value_t exports) {
  iotjs_jval_set_method(exports, "verify", VerifyImage);
  iotjs_jval_set_method(exports, "prepare", PrepareImage);
  iotjs_jval_set_method(exports, "upgrade", UpgradeImage);
}

NODE_MODULE(recovery, init)
