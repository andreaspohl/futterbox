// reads magnet switch input
// if closed, barn door is closed, turn LED off
// if opened, barn door is opened, then blink LED
// present door state on webserver as hobebridge json data


#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>

const char* ssid     = "XXXX";
const char* password = "XXXX";

int ledPin = 5; // pin D1
int doorSensor = 4; // pin D2
unsigned long previousMillis = 0; // will store last time LED was updated
bool doorClosed = false; // door state
const long interval = 250;       // interval at which to blink (milliseconds)
int ledState = LOW;             // ledState used to set the LED


ESP8266WebServer server(80);

void handle_root() {
  server.send(200, "text/plain", "Tor zur Futterbox, lesen mit /futterbox");
  delay(100);
}

void readDoorSensor() {
  int doorState = digitalRead(doorSensor);
  doorClosed = !doorState;
  Serial.print("doorClosed: ");
  Serial.println(doorClosed);
}

void setup(void)
{
  // status logging
  Serial.begin(115200); 

  pinMode(doorSensor, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);

  // Connect to WiFi network
  Serial.print("Connecting to ");
  Serial.print(ssid);
 
  WiFi.begin(ssid, password);
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  // Print the IP address
  Serial.print("Use this URL to connect: ");
  Serial.print("http://");
  Serial.print(WiFi.localIP());
  Serial.println("/");

  server.on("/", handle_root);

  server.on("/futterbox/state", []() {
    readDoorSensor();
    char* statusText = 0;
    if (doorClosed) {
      statusText = "CLOSED";
    } else {
      statusText = "OPEN";
    }
    server.send(200, "data", statusText);
  });

  server.on("/futterbox/target", []() {
    readDoorSensor();
    char* statusText = 0;
    if (doorClosed) {
      statusText = "CLOSED";
    } else {
      statusText = "OPEN";
    }
    server.send(200, "data", statusText);
  });

  server.begin();
  Serial.println("HTTP server started");
}

void loop(void)
{
  server.handleClient();

  // blink LED
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    // save the last time you blinked the LED
    previousMillis = currentMillis;

    readDoorSensor();

    // if the LED is off turn it on and vice-versa (only if door is open)
    if (ledState == LOW || doorClosed) {
      ledState = HIGH;
    } else {
      ledState = LOW;
    }

    // set the LED with the ledState of the variable:
    digitalWrite(ledPin, !ledState);
  }
}
