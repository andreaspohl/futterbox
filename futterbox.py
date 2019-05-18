import requests
from sense_hat import SenseHat
from time import sleep


sense = SenseHat()
sense.set_rotation(90)

red = (255, 0, 0)
yellow = (50, 50, 0)
green = (0, 100, 0)
blue = (0, 0, 50)

while True:
    try:
        resp = requests.get('http://10.0.1.200/futterbox/state')
        status = resp.text
        if status == 'CLOSED':
            sense.show_letter(' ', text_colour=green)
        else:
            sense.show_letter('X', text_colour=red)
    except:
            sense.show_letter('?', text_colour=yellow)
    for x in range(100, 256):
        sense.set_pixel(7, 0, (0, 0, x))
        sleep(0.015)
    for x in range(255, 100, -1):
        sense.set_pixel(7, 0, (0, 0, x))
        sleep(0.015)
