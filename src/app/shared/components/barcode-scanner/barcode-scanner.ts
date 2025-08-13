import { Component, OnDestroy, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BrowserMultiFormatReader } from '@zxing/browser';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule // ← Critical for standalone
  ],
  templateUrl: './barcode-scanner.html',
  styleUrls: ['./barcode-scanner.scss']
})
export class BarcodeScanner implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  scanner = new BrowserMultiFormatReader();
  isScanning = false;
  scannedCode = '';
  scanTimeout: any;
  @Output() codeScanned = new EventEmitter<string>();

  ngAfterViewInit() {
    this.setupScanner();
  }

  async setupScanner() {
    try {
      // 🔑 CRITICAL FIX FOR FIREFOX ANDROID 🔑
      const isFirefoxAndroid = this.isFirefoxAndroid();
      let constraints: MediaStreamConstraints;

      if (isFirefoxAndroid) {
        // Firefox Android requires EXPLICIT device selection
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');

        // Find rear camera by label (works on most devices)
        let rearCamera = videoDevices.find(device =>
          /back|rear|environment/i.test(device.label)
        );

        // Fallback for devices with empty labels (common on Android)
        if (!rearCamera && videoDevices.length > 1) {
          rearCamera = videoDevices[1]; // Second device is usually rear on Android
        }

        constraints = {
          video: rearCamera
            ? { deviceId: { exact: rearCamera.deviceId } }
            : { facingMode: 'environment' } // Final fallback
        };
      } else {
        // Standard approach for other browsers
        constraints = {
          video: {
            facingMode: 'environment',
            width: { min: 1280 },
            height: { min: 720 }
          }
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.nativeElement.srcObject = stream;
      this.videoElement.nativeElement.play(); // Critical for Firefox

    } catch (err) {
      // ... existing error handling ...
    }
  }

  // Helper function to detect Firefox Android
  private isFirefoxAndroid(): boolean {
    return /Firefox\/\d+/.test(navigator.userAgent) &&
      /Android/.test(navigator.userAgent);
  }

  toggleScanner() {
    if (this.isScanning) {
      this.stopScanner();
    } else {
      this.startScanner();
    }
  }

  startScanner() {
    this.isScanning = true;
    this.scannedCode = '';

    // Start continuous scanning
    this.scanTimeout = setInterval(() => {
      this.scanner
        .decodeOnceFromVideoElement(this.videoElement.nativeElement)
        .then(result => {
          const code = result.getText();
          this.codeScanned.emit(code); // EMIT SCANNED CODE
          this.scannedCode = code;
          this.stopScanner();
          //alert('✅ Barcode scanned successfully!');
        })
        .catch(() => { /* continue scanning */ });
    }, 500);
  }

  stopScanner() {
    this.isScanning = false;
    clearInterval(this.scanTimeout);

    // Clean up video stream
    const stream = this.videoElement.nativeElement.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }

  ngOnDestroy() {
    this.stopScanner();
  }
}