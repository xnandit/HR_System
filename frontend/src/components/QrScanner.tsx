"use client";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QrScanner({ onScan }: { onScan: (result: string) => void }) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    let isMounted = true;
    if (!scannerRef.current) return;
    try {
      html5QrCodeRef.current = new Html5Qrcode(scannerRef.current.id);
      html5QrCodeRef.current
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            if (isMounted) onScan(decodedText);
          },
          () => {}
        )
        .then(() => {})
        .catch((err: unknown) => {
          if (typeof err === 'string') setError('Camera access error: ' + err);
          else if (err instanceof Error) setError('Camera access error: ' + err.message);
          else setError('Camera access error: Unknown error');
        });
    } catch (e: unknown) {
      if (e instanceof Error) setError('Failed to start QR scanner: ' + e.message);
      else setError('Failed to start QR scanner: Unknown error');
    }
    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current?.clear();
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  return (
    <div>
      <div id="qr-scanner" ref={scannerRef} style={{ width: 260, height: 260, margin: "0 auto" }} />
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!isLoaded && !error && <div className="text-gray-500">Memuat scanner...</div>}
    </div>
  );
}
