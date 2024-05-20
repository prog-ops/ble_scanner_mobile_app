import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import notifee from '@notifee/react-native';
import useCustomHook from './hooks/useCustomHook';
import {MyText} from './components/MyText';
import PeripheralModal from './components/CustomModal';
import Orientation from "react-native-orientation-locker";

const BLEScreen = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    characteristics,
    disconnectFromDevice,
    bleError,
  } = useCustomHook();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        onDisplayNotification();
        scanForPeripherals();
      }
    });
  };

  const hideModal = () => {
    setIsModalVisible(false);
    cancel();
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  const notificationId: string = 'NotificationId';

  /**
   * Display notification when scan starts (and close it after select the device)
   */
  async function onDisplayNotification() {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: notificationId,
      name: 'Default Channel',
    });

    await notifee.displayNotification({
      title: 'BLE Scanner',
      body: 'Now scanning...',
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  /**
   * Remove the notification after a device is connected
   */
  async function cancel() {
    await notifee.cancelAllNotifications();
  }

  useEffect(() => {
    // lock the screen orientation to portrait
    Orientation.lockToPortrait();
    // unlock orientation when the component unmounts
    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('./../assets/images/background.jpg')}
        blurRadius={Platform.OS === 'ios' ? 10 : 0} // Apply blur only on iOS
        style={styles.titleWrapper}>
        {connectedDevice ? (
          <>
            <Text style={styles.titleText}>BLE Peripheral Data:</Text>

            <MyText
              style={[styles.text, {color: 'blue'}]}
              children={connectedDevice.id}
            />
            <MyText
              style={[styles.text, {color: 'blue'}]}
              children={'Name: ' + connectedDevice.name}
            />
            <MyText
              style={[styles.text, {color: 'blue'}]}
              children={'MTU: ' + connectedDevice.mtu}
            />
            <MyText
              style={[styles.text, {color: 'blue'}]}
              children={
                'rawScanRecord: ' + connectedDevice.rawScanRecord ?? 'Null'
              }
            />
            <MyText
              style={[styles.text, {color: 'blue'}]}
              children={connectedDevice.rssi?.toString()}
            />
          </>
        ) : (
          <MyText
            style={[styles.text, {color: 'red'}]}
            children="Connect to your BLE Peripheral"
          />
        )}

        <MyText
          style={[styles.text, {color: 'orange'}]}
          children={connectedDevice ? bleError?.message : ''}
        />
      </ImageBackground>
      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={connectedDevice ? styles.ctaButtonDisconnect : styles.ctaButton}>
        <Text style={styles.ctaButtonText}>
          {connectedDevice
            ? `Disconnect ${connectedDevice.name}`
            : 'Scan devices'}
        </Text>
      </TouchableOpacity>
      <PeripheralModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  titleWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    color: 'black',
  },
  text: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton: {
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    borderTopStartRadius: 18,
    borderTopEndRadius: 18,
  },
  ctaButtonDisconnect: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    borderTopStartRadius: 18,
    borderTopEndRadius: 18,
  },
  ctaButtonText: {
    fontSize: 22,
    color: 'white',
  },
});

export default BLEScreen;
