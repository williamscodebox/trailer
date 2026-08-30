import { Buffer } from "buffer";
import { BleManager, Characteristic, Device } from "react-native-ble-plx";
(globalThis as any).Buffer = Buffer;


const TARGET_NAME = "TrailerControllerBLE";
const SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
const RX_UUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
const TX_UUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";

class BLEController {
  manager = new BleManager();
  device: Device | null = null;
  txChar: Characteristic | null = null;

  onStatusChange?: (status: string) => void;
  onTrailerState?: (state: string) => void;

  setStatus(status: string) {
    console.log("BLE STATUS:", status);
    this.onStatusChange?.(status);
  }

  async scanAndConnect() {
    console.log("Scanning for BLE devices...");
    this.setStatus("scanning");

    return new Promise<void>((resolve) => {
      this.manager.startDeviceScan(null, null, async (error, scannedDevice) => {
        if (error) {  
          this.setStatus("disconnected");
          console.log("Scan error:", error);
          return;
        }

        if (scannedDevice?.name === TARGET_NAME) {
          console.log("Found device:", scannedDevice.name);

          this.manager.stopDeviceScan();
          this.setStatus("connecting");

          this.device = await scannedDevice.connect();
          await this.device.discoverAllServicesAndCharacteristics();

          const services = await this.device.services();
          for (const service of services) {
            if (service.uuid === SERVICE_UUID) {
              const chars = await service.characteristics();
              for (const c of chars) {
                if (c.uuid === TX_UUID) this.txChar = c;
                 // ⭐ Subscribe to notifications
                  c.monitor((error, characteristic) => {
                    if (error) return;

                    const value = characteristic?.value;
                    if (!value) return;

                    const decoded = Buffer.from(value, "base64").toString("utf8");
                    this.onTrailerState?.(decoded);
                  });
                }
              }
          }

          console.log("Connected + characteristics ready");
          this.setStatus("connected");
          resolve();
        }
      });
    });
  }

  async write(cmd: string) {
    if (!this.device || !this.txChar) {
      console.log("BLE not ready");
      this.setStatus("disconnected");
      return;
    }

    await this.txChar.writeWithoutResponse(cmd);
    console.log("Sent:", cmd);
  }

  async autoReconnect() {
    const connected = await this.manager.connectedDevices([SERVICE_UUID]);
    if (connected.length > 0) {
      console.log("Auto-reconnected to:", connected[0].name);
      this.device = connected[0];
      this.setStatus("connected");
      return true;
    }
    return false;
  }
}

export const BLE = new BLEController();
