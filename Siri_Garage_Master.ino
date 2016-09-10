/* Siri garage 2 channel
 * 
 * 0 is open
 * 1 is close
 * 30 cm min distance
 * 
 * topic 1 is Big Garage
 * topic 2 is little Garage
 */
int mindist = 30;

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <NewPing.h>

// Network info

const char* ssid = "On-Hub";
const char* password = "5622123212";
const char* mqtt_server = "192.168.1.190";

//MQTT setup

WiFiClient wifiClient;
PubSubClient client(wifiClient);
long lastMsg = 0;
char msg[50];
int value = 0;

//Sensor setup

#define MAX_DISTANCE 200
#define PING_INTERVAL 33
NewPing sonar[2] = { 
NewPing(D5, D6, MAX_DISTANCE),
NewPing(D7, D8, MAX_DISTANCE)
};

long unsigned int average1;
long unsigned int average2;
long unsigned int dist[2][10];
int j = 0;

bool currentstate1;
bool targetstate1;
bool currentstate2;
bool targetstate2;

void setup() {
  pinMode(BUILTIN_LED, OUTPUT);     // Initialize the BUILTIN_LED pin as an output
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  pinMode(D1, OUTPUT);
  digitalWrite(D1, HIGH);
  pinMode(D2, OUTPUT);
  digitalWrite(D2, HIGH);
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  String strTopic = String((char*)topic);
  Serial.println();

  //topic 1
  if (strTopic == "inTopic1") {
  if ((char)payload[0] == '0') {
    targetstate1 = 0;
    Serial.println("Target state: open");
  } else if ((char)payload[0] == '1') {
    targetstate1 = 1;
    Serial.println("Target state: closed");
  }
  if ((targetstate1 != currentstate1)) {
    digitalWrite(D1,LOW);
    delay(300);
    digitalWrite(D1,HIGH);
    Serial.println("Trigger");
  }
  }
  //topic 2
  if (strTopic == "inTopic2") {
  if ((char)payload[0] == '0') {
    targetstate2 = 0;
    Serial.println("Target state: open");
  } else if ((char)payload[0] == '1') {
    targetstate2 = 1;
    Serial.println("Target state: closed");
  }
  if ((targetstate2 != currentstate2)) {
    digitalWrite(D2,LOW);
    delay(300);
    digitalWrite(D2,HIGH);
    Serial.println("Trigger");
  }
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP8266Client")) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish("outTopic1", "hello world");
      // ... and resubscribe
      client.subscribe("inTopic1");
      client.subscribe("inTopic2");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
void loop() {
  //MQTT
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  long nowMsg = millis();
  if (nowMsg - lastMsg > 2000) {
    lastMsg = nowMsg;
    ++value;
    //Serial.print("Publish message: ");
    //Serial.println(msg);
    //client.publish("outTopic", msg);
    if ((average1 >= mindist) || (average1 == 0 )) {
      Serial.println("current state1: closed");
      client.publish("outTopic1", "1");
      currentstate1 = 1;
    }
    else if (average1 <= mindist) {
      Serial.println("current state1: open");
      client.publish("outTopic1", "0");
      currentstate1 = 0;
    }
    if ((average2 >= mindist) || (average2 == 0 )) {
      Serial.println("current state2: closed");
      client.publish("outTopic2", "1");
      currentstate2 = 1;
    }
    else if (average2 <= mindist) {
      Serial.println("current state2: open");
      client.publish("outTopic2", "0");
      currentstate2 = 0;
    }
  }

  //Ping
  j = j+1;
  if (j >= 5) {
    j = 0;
  }
  for (uint8_t i = 0; i < 2; i++) { 
    delay(50); 
    dist[i][j] = sonar[i].ping_cm();
  }
  average1 = 0;
  average2 = 0;
  for (uint8_t j = 0; j < 5; j++) { 
    average1 = average1 + dist[0][j];
    average2 = average2 + dist[1][j];
  }
  average1 = average1/5;
  average2 = average2/5;
  Serial.println(average1);
}
