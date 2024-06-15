#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <AsyncJson.h>

AsyncWebServer server(80);
Ticker rebootTimer;

void WebServer_init()
{
    server.on("/metrics/history.csv", HTTP_GET, [](AsyncWebServerRequest *request){
    Serial.println("GET /metrics/csv");
    AsyncResponseStream *response = request->beginResponseStream("text/csv");
    // Use querystring to determine which history file to return
    String offset = "0";
    if (request->hasParam("offset")) {
      offset = request->arg("offset");
    }
    String path = METRICS_FILE_FORMAT;
    path.replace("#", offset);
    Serial.print("Reading: ");
    Serial.println(path);
    File file = LittleFS.open(path.c_str(), "r");
    if (file) {
      char c;
      while (file.available()) {
        c = file.read();
        response->write(c);
      }
      // Add EOL per file; 
      if (c != '\n') response->write('\n');
      file.close();
    }
    request->send(response);
  });

  server.on("/metrics/current.json", HTTP_GET, [](AsyncWebServerRequest *request){
    Serial.println("GET /metrics/current.json");
    AsyncJsonResponse * response = new AsyncJsonResponse();
    JsonObject root = response->getRoot();
    root["inside"] = metric.inside;
    root["outside"] = metric.outside;
    root["fan"] = metric.fan;
    root["count"] = metric.count;
    root["enabled"] = setting_fan_enabled;
    response->setLength();
    request->send(response);
  });

  server.addHandler(new AsyncCallbackJsonWebHandler("/settings/fan.json", [](AsyncWebServerRequest *request, JsonVariant &json) {
    Serial.println("POST /settings/fan.json");
    Settings_save(json.as<JsonObject>(), "fan");
    Settings_load("fan");
    GPIO_blink(2, 10);
    request->send(200);
  }));

  server.addHandler(new AsyncCallbackJsonWebHandler("/settings/wifi.json", [](AsyncWebServerRequest *request, JsonVariant &json) {
    Serial.println("POST /settings/wifi.json");
    Settings_save(json.as<JsonObject>(), "wifi");
    Settings_load("wifi");
    GPIO_blink(2, 10);
    request->send(200);
  }));

  server.addHandler(new AsyncCallbackJsonWebHandler("/settings/telemetry.json", [](AsyncWebServerRequest *request, JsonVariant &json) {
    Serial.println("POST /settings/telemetry.json");
    Settings_save(json.as<JsonObject>(), "telemetry");
    Settings_load("telemetry");
    GPIO_blink(2, 10);
    request->send(200);
  }));

  server.addHandler(new AsyncCallbackJsonWebHandler("/settings/reboot.json", [](AsyncWebServerRequest *request, JsonVariant &json) {
    Serial.println("POST /settings/reboot.json");
    Settings_save(json.as<JsonObject>(), "reboot");
    Settings_load("reboot");
    GPIO_blink(2, 10);
    request->send(200);
  }));

  server.on("/api/reboot", HTTP_POST, [](AsyncWebServerRequest *request){
    Serial.println("POST /api/reboot");
    if (request->hasHeader("Authorization")) {
      String expected = "Bearer #";
      expected.replace("#", setting_reboot_key);
      if (request->header("Authorization") == expected) {
        // Use timer otherwise we cant send reponse.
        rebootTimer.once_ms_scheduled(500, []() {
          GPIO_blink(GPIO_RED_LED, 5, SECOND);
          ESP.restart();
        });
        request->send(200);
        return;
      }
    }
    request->send(401);
  });

  server.on("/settings/files.json", HTTP_GET, [](AsyncWebServerRequest *request){
    Serial.println("GET /settings/files.json");
    GPIO_blink(2, 10);
    AsyncResponseStream *response = request->beginResponseStream("application/json");
    JsonDocument doc = FS_infoJson();
    serializeJson(doc, *response);
    request->send(response);
  });

  server
    .serveStatic("/", LittleFS, "/www/")
    .setCacheControl("max-age=300") // 5 minutes
    .setDefaultFile("index.html");

  server
    .serveStatic("/settings", LittleFS, "/settings/")
    .setCacheControl("no-cache, no-store, must-revalidate") 
    .setAuthentication("admin", setting_wifi_password.c_str());

  server
    .serveStatic("/admin", LittleFS, "/admin/")
    .setCacheControl("max-age=300") // 5 minutes
    .setDefaultFile("index.html")
    .setAuthentication("admin", setting_wifi_password.c_str());

  server.begin();
}
