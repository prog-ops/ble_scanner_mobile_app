This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# BLE Devices Scanner App

# Integrating BLE Device Scanner into a React Native Application

How to integrate Bluetooth Low Energy (BLE) device scanning into your React Native application using the `react-native-ble-plx` library.

## Installation

Before we begin, ensure you have React Native set up in your project. Then, install `react-native-ble-plx`:

```bash
npm install @react-native-community/ble-plx
```

or using Yarn: `yarn add @react-native-community/ble-plx`

# Considerations

Handle Permissions:
Make sure your application has the necessary permissions to access Bluetooth on both Android and iOS devices.

Stop Device Scan (Optional):
Remember to stop scanning when it's no longer necessary to conserve battery life.

Error Handling: 
Implement proper error handling to handle any errors that may occur during scanning.

RSSI (signal strength): Sometimes signal strength is hard to detect due to many factors such as device conditions, therefore it shows unknown signal strength instead.

## How to Use

1. Run app, press "Scan Devices", it will show Modal of nearby BLE devices list
2. Now it is scanning nearby bluetooth devices and showing notification while scanning
3. Select BLE device you want to connect
4. It will go back to main screen and display selected BLE device data like Device ID, UUID, RSSI, etc.

## Scan devices

Main screen

![Screenshot_20240519_141934_pnpx_rn](https://github.com/prog-ops/ble_scanner_mobile_app/assets/59245989/dd85dae6-4035-476c-86b1-fa198616a9a2)


## It will detect active nearby Bluetooth devices

![Screenshot_20240519_142203_pnpx_rn](https://github.com/prog-ops/ble_scanner_mobile_app/assets/59245989/0703a1b5-dca2-4d33-a38d-2a691c60fdf2)

![Screenshot_20240519_143109_pnpx_rn](https://github.com/prog-ops/ble_scanner_mobile_app/assets/59245989/0b15618a-5bd1-4a09-a79a-0f029ba3cad4)

Select the device you want to connect


## BLE Device Data

It will show selected device data

![Screenshot_20240519_143133_pnpx_rn](https://github.com/prog-ops/ble_scanner_mobile_app/assets/59245989/9a451f7a-64bd-4b20-ada6-780bf43d9030)

![Screenshot_20240519_142403_pnpx_rn](https://github.com/prog-ops/ble_scanner_mobile_app/assets/59245989/5766f8d0-a217-43b0-aea2-ccfc328aa0c4)

![Screenshot_20240519_142525_pnpx_rn](https://github.com/prog-ops/ble_scanner_mobile_app/assets/59245989/4135046e-952a-46a0-8678-bd081997d593)


Disconnecting a device redirects to main screen
