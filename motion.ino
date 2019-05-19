#include <AWS_IOT.h>
#include <WiFi.h>

AWS_IOT hornbill;

char WIFI_SSID[]="hackathon2019";
char WIFI_PASSWORD[]="fearlesscoder";
char HOST_ADDRESS[]="a2bwgh96pae15j-ats.iot.us-west-2.amazonaws.com";
char CLIENT_ID[]= "client id";
char TOPIC_NAME[]= "$aws/things/motion/shadow/update";


int status = WL_IDLE_STATUS;
int tick=0,msgCount=0,msgReceived = 0;
char payload[512];
char rcvdPayload[512];

void mySubCallBackHandler (char *topicName, int payloadLen, char *payLoad)
{
    strncpy(rcvdPayload,payLoad,payloadLen);
    rcvdPayload[payloadLen] = 0;
    msgReceived = 1;
}


int inPin = 18;
int val = 0;
int ledPinWhite = 22;
int ledPinBlue = 21;
int ledPinRed = 23;
int isActivated = 0;

void setup() {
    Serial.begin(115200);
    delay(2000);

    pinMode(inPin, INPUT);
    pinMode(ledPinWhite, OUTPUT);
    pinMode(ledPinBlue, OUTPUT);
    pinMode(ledPinRed, OUTPUT);

    while (status != WL_CONNECTED)
    {
        Serial.print("Attempting to connect to SSID: ");
        Serial.println(WIFI_SSID);
        // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
        status = WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

        // wait 5 seconds for connection:
        delay(5000);
    }

    Serial.println("Connected to wifi");

    if(hornbill.connect(HOST_ADDRESS,CLIENT_ID)== 0)
    {
        Serial.println("Connected to AWS");
        delay(1000);

        if(0==hornbill.subscribe(TOPIC_NAME,mySubCallBackHandler))
        {
            Serial.println("Subscribe Successfull");
        }
        else
        {
            Serial.println("Subscribe Failed, Check the Thing Name and Certificates");
            while(1);
        }
    }
    else
    {
        Serial.println("AWS connection failed, Check the HOST Address");
        while(1);
    }

    delay(2000);

}

void loop() {

    if(msgReceived == 1)
    {
        msgReceived = 0;
        Serial.print("Received Message:");
        Serial.println(rcvdPayload);
        val = digitalRead(inPin);
        if (val != 0) {
            isActivated = 1;
            Serial.println("Motion detected");
            digitalWrite(ledPinRed, HIGH);
            delay(200);
            digitalWrite(ledPinRed, LOW);
            digitalWrite(ledPinWhite, HIGH);
            digitalWrite(ledPinBlue, LOW);
            delay(200);
            digitalWrite(ledPinWhite, LOW);
            digitalWrite(ledPinBlue, HIGH);
            delay(200);
            digitalWrite(ledPinBlue, LOW);
        }
        else {
          isActivated = 0;
        }
        delay(200);

    }
      // publish to topic every 5seconds
    {
        tick=0;
        sprintf(payload,"{ \"state\": { \"desired\": {\"activate\":${isActivated}}}}");
        if(hornbill.publish(TOPIC_NAME,payload) == 0)
        {        
            Serial.print("Publish Message:");
            Serial.println(payload);
        }
        else
        {
            Serial.println("Publish failed");
        }
    }  
    vTaskDelay(1000 / portTICK_RATE_MS);
    tick++;
}
