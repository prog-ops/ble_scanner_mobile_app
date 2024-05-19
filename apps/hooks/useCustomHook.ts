import {useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';
import notifee from '@notifee/react-native';

const bleManager = new BleManager();

type VoidCallback = (result: boolean) => void;

interface BluetoothLowEnergyApi {
  requestPermissions(cb: VoidCallback): Promise<void>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  characteristics: string[];
  bleError: BleError | undefined;
}

function useCustomHook(): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [bleError, setBleError] = useState<BleError>();

  const requestPermissions = async (cb: VoidCallback) => {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);

        const isGranted =
          result['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      }
    } else {
      cb(true);
    }
  };

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex(device => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device.name !== '') {
        //
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });
  };

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();

      await notifee.cancelAllNotifications(); // Remove the notification after a device is connected

      startStreamingData(deviceConnection);
    } catch (e) {
      console.log('FAILED TO CONNECT', e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setCharacteristics(prevState => [...prevState]);
      // setCharacteristics(prevState => [...prevState, `${connectedDevice.name} just disconnected`]); //✔️ list ble yg baru saja disconnect
    }
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      let serviceUUID: string = '';
      let characteristicUuid: string = '';
      device.serviceUUIDs?.forEach(UUID => {
        serviceUUID = UUID;
      });

      if (Platform.OS === 'ios') {
        device.overflowServiceUUIDs?.forEach(UUID => {
          characteristicUuid = UUID;
        });
      } else {
        device.solicitedServiceUUIDs?.forEach(UUID => {
          characteristicUuid = UUID;
        });
      }

      device.monitorCharacteristicForService(
        serviceUUID,
        characteristicUuid,
        (error, characteristic) => onHeartRateUpdate(error, characteristic),
        '',
      );
    } else {
      console.log('No BLE Peripheral Connected');
    }
  };

  const onHeartRateUpdate = (
    bleError: BleError | null,
    characteristic: Characteristic | null,
  ) => {
    if (bleError) {
      console.log(bleError);
      setBleError(bleError);
      return -1;
    } else if (!characteristic?.value) {
      console.log('No Data was received');
      return -1;
    }

    const error = bleError;
    const id = characteristic.id;
    const deviceID = characteristic.deviceID;
    const value = characteristic.value;
    const uuid = characteristic.uuid;
    const serviceUUID = characteristic.serviceUUID;
    const monitor = characteristic.monitor(() => {}, '');

    setCharacteristics(prevState => [
      ...prevState,
      id.toString(),
      deviceID,
      value,
      uuid,
      serviceUUID,
      error!,
      monitor.toString(),
    ]);
  };

  const onBleError = (): BleError | undefined => {
    return bleError;
  };

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    characteristics,
    bleError,
  };
}

export default useCustomHook;
