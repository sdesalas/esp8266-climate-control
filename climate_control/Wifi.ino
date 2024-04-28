
IPAddress APIP(192, 168, 66, 1); // Admin IP
Ticker blinker;

void Wifi_init() {
  const char* ssid = setting_wifi_ssid.c_str();
  const char* password = setting_wifi_password.c_str();
  Serial.println("Initializing Wifi..");
  Serial.printf("Creating AP '%s' with password '%s'....\n", setting_wifi_ssid.c_str(),  setting_wifi_password.c_str());
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(APIP, APIP, IPAddress(255, 255, 255, 0));
  if (WiFi.softAP(ssid, password, 1, setting_wifi_hidden)) {
    Serial.println("AP Created!");
    // Blink every 5 seconds
    blinker.attach_ms_scheduled(5005, []() {
      Serial.print("ESP.getFreeHeap(): ");
      Serial.println(ESP.getFreeHeap());
      GPIO_blink(WiFi.softAPgetStationNum() + 1, 100);
      digitalWrite(GPIO_RED_LED, WiFi.softAPgetStationNum() > 0 ? 1 : 0);
    });
  } else {
    Serial.println("Error! Cannot create AP. Reboot in 5 seconds..");
    GPIO_blink(GPIO_RED_LED, 5, SECOND);
    ESP.restart();
  }
}

