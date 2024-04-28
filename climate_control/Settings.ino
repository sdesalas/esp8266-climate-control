#define SETTINGS_FILE_COUNT 4
#define SETTINGS_DEFAULTS_TEMPLATE "/defaults/#.json"
#define SETTINGS_FILE_TEMPLATE  "/settings/#.json"

void Settings_init() {
  // Initialize the settings
  Settings_load("wifi");
  Settings_load("fan");
  Settings_load("telemetry");
  Settings_load("reboot");
  Serial.print("The SSID is ");
  Serial.println(setting_wifi_ssid);
  Serial.print("Telemetry URL is ");
  Serial.println(setting_telemetry_url);
  Serial.print("Telemetry frequency is ");
  Serial.println(setting_telemetry_frequency);
  Serial.print("Fan cold is ");
  Serial.println(setting_fan_cold);
}

void Settings_load(const char* file) {
    String settingsPath = SETTINGS_FILE_TEMPLATE;
    settingsPath.replace("#", file);
    JsonDocument doc = FS_readJson(settingsPath.c_str());
    JsonObject setting = doc.as<JsonObject>();
    if (strcmp(file, "fan") == 0) {
      setting_fan_enabled = setting["enabled"] | false;
      setting_fan_cold = setting["cold"] | 0;
      setting_fan_hot = setting["hot"] | 0;
      setting_fan_buffer = setting["buffer"] | 0;
      setting_fan_swapsensors = setting["swapsensors"] | false;
    }
    if (strcmp(file, "wifi") == 0) {
      setting_wifi_ssid = setting["ssid"] | "";
      setting_wifi_password = setting["password"] | "";
      setting_wifi_hidden = setting["hidden"] | false;
    }
    if (strcmp(file, "telemetry") == 0) {
      setting_telemetry_frequency = setting["frequency"] | 0;
      setting_telemetry_url = setting["url"] | "";
      setting_telemetry_bucket = setting["bucket"] | "";
      setting_telemetry_org = setting["org"] | "";
      setting_telemetry_token = setting["token"] | "";
      setting_telemetry_ssid = setting["ssid"] | "";
      setting_telemetry_password = setting["password"] | "";
    }
    if (strcmp(file, "reboot") == 0) {
      setting_reboot_ota = setting["ota"] | false;
      setting_reboot_key = setting["key"] | "";
    }
}

bool Settings_save(JsonObjectConst input, const char* file) {
    // Get the defaults, then overwrite with input
    String defaultsPath = SETTINGS_DEFAULTS_TEMPLATE;
    defaultsPath.replace("#", file);
    JsonDocument doc = FS_readJson(defaultsPath.c_str());
    JsonObject settings = doc.as<JsonObject>();
    for (JsonPairConst kv: input) {
      settings[kv.key()] = kv.value();
    }
    // Save settings to file
    String settingsPath = SETTINGS_FILE_TEMPLATE;
    settingsPath.replace("#", file);
    return FS_writeJson(settingsPath.c_str(), settings) > 0;
}

void Settings_reset() {
  String files[SETTINGS_FILE_COUNT] = { "fan", "wifi", "telemetry", "reboot" };
  for (int i = 0; i < SETTINGS_FILE_COUNT; i++) {
    String defaultsPath = SETTINGS_DEFAULTS_TEMPLATE;
    String settingsPath = SETTINGS_FILE_TEMPLATE;
    defaultsPath.replace("#", files[i]);
    settingsPath.replace("#", files[i]);
    Serial.print("Resetting ");
    Serial.println(settingsPath);
    File from = LittleFS.open(defaultsPath, "r");
    File to = LittleFS.open(settingsPath, "w");
    while(from.available()) {
      char c = from.read();
      to.write(c);
    }
    from.close();
    to.close();
  }
}