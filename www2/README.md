# 2023 Takahoot client

This project runs with Angular 15 and was developed with node 16 (npm).  
Run `npm install` to download dependencies.

[https://caniuse.com/web-serial](WebSerial) is used in order to access to Arduino controller. Beware WebSerial API is not well supported on popular browsers.
This project is guaranteed to work with Google Chrome version 108 to 111. 

The production bundle setup is not configured yet. The application is launched through the development server using `npm run start`.

You may need to add `127.0.0.1    takahoot.takima.io` to your file `/etc/hosts` (sudo required).

Then, you will have access to Takahoot client through [https://takahoot.takima.io](https://takahoot.takima.io). HTTPS is mandatory to be able to access connected peripherals.

## User guide

- Connect all your ports.
- Bind them to a target.
- You can perform several actions by clicking on the buttons:
  - reset: it sends the reset command to the controller, so they should return to the initial state and light up in purple (not listening to anything except initialize command in purple state) ;
  - activate: each target will take its color (red, blue, yellow, green). Targets are ready to be triggered on this state. Physically tap on a target to trigger a hit. Once triggered, it should start blinking ;
  - deactivate: all targets are not listening to hits, and blink in orange ;
  - get state: sends a request to the Arduino controller, and print its response about its state via console.log.
- You can enter the pin code of the Kahoot game session, then press connect to join the lobby with each target.
- The initialize button launches a bunch of commands, that basically initialize the target to listen to further commands, triggers a autocalibration sequence, and sets an additional offset of ~50% in bumper sensitivity.
- You can also click on UI targets to replicate physical hits
- There are 4 sliders to configure sensivity: they auto update to the last sensivity status returned by the Arduino controller, and you can set new values and click on the button to apply your new preferences.

## Troubleshoots

- You may need to authorize node to run on port 443 to launch the app: `sudo setcap 'cap_net_bind_service=+ep' $(readlink -f $(which node))`
- You may need to grant read/write access on your Controllers to the browser:  
`sudo chmod a+rw /dev/ttyACM0`  
`sudo chmod a+rw /dev/ttyACM1`  
`sudo chmod a+rw /dev/ttyACM2`.
