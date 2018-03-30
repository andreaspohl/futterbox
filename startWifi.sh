#!/bin/bash
# starts wifi after boot

echo "delay starting wifi"
sleep 60
echo "starting wifi...."

ip link set wlan0 down
ip link set wlan0 up
connmanctl disable wifi
connmanctl enable wifi
connmanctl connect wifi_74da38d00bc5_41414141_managed_psk

echo "wifi started."
exit 0

