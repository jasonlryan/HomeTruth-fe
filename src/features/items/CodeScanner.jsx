import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
export async function decodePixels(data, width, height) {
  return jsQR(data, width, height, {
    inversionAttempts: 'attemptBoth'
  })?.data || null;
}
async function decodeImage(image) {
  const width = image.videoWidth || image.width,
    height = image.videoHeight || image.height;
  const scale = Math.min(1, 1600 / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d', {
    willReadFrequently: true
  });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  if (window.BarcodeDetector) {
    try {
      const codes = await new window.BarcodeDetector().detect(canvas);
      if (codes[0]?.rawValue) return codes[0].rawValue;
    } catch {/* QR decoding below works without native barcode support. */}
  }
  return decodePixels(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
}
export default function CodeScanner({
  onCode
}) {
  const [running, setRunning] = useState(false),
    [error, setError] = useState('');
  const video = useRef(null),
    stream = useRef(null),
    cycle = useRef(0),
    mounted = useRef(true);
  const stop = () => {
    cycle.current += 1;
    stream.current?.getTracks().forEach(t => t.stop());
    stream.current = null;
    if (mounted.current) setRunning(false);
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cycle.current += 1;
      stream.current?.getTracks().forEach(t => t.stop());
    };
  }, []);
  const scan = async () => {
    setError('');
    stop();
    const active = cycle.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera scanning is unavailable in this browser. Choose a code photo below.');
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: 'environment'
          }
        },
        audio: false
      });
      if (!mounted.current || active !== cycle.current) {
        media.getTracks().forEach(t => t.stop());
        return;
      }
      stream.current = media;
      video.current.srcObject = media;
      await video.current.play();
      setRunning(true);
      const frame = async () => {
        if (!mounted.current || active !== cycle.current) return;
        try {
          if (video.current.readyState >= 2) {
            const code = await decodeImage(video.current);
            if (code) {
              onCode(code.slice(0, 24000));
              stop();
              return;
            }
          }
        } catch {
          setError('The camera frame could not be read. Try a code photo.');
          stop();
          return;
        }
        if (active === cycle.current) setTimeout(frame, 200);
      };
      frame();
    } catch (e) {
      if (mounted.current && active === cycle.current) {
        setError(e.message || 'Camera access failed. Try a code photo.');
        stop();
      }
    }
  };
  const photo = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    stop();
    const active = cycle.current;
    if (file.size > 5 * 1024 * 1024) {
      setError('Choose a code image under 5 MB.');
      return;
    }
    let image;
    try {
      image = await createImageBitmap(file);
      const code = await decodeImage(image);
      if (!mounted.current || active !== cycle.current) return;
      if (!code) throw new Error('No code could be read. Try a clearer image, a label photo or selected receipt.');
      onCode(code.slice(0, 24000));
    } catch (e) {
      if (mounted.current && active === cycle.current) setError(e.message || 'This code image could not be read. Try a label photo.');
    } finally {
      image?.close();
    }
  };
  return <div className="item-intake"><p>Scan a QR code or choose a code photo. Decoding happens on your device. Review the result before asking HomeTruth to identify it.</p><video ref={video} muted playsInline aria-label="Code scanner camera" hidden={!running} style={{
      maxWidth: '100%',
      maxHeight: 260
    }} /><div className="journey-actions"><button type="button" className="journey-button journey-secondary" onClick={running ? stop : scan}>{running ? 'Stop camera' : 'Scan with camera'}</button></div><label className="item-field">Choose a QR or barcode photo<input type="file" accept="image/*" capture="environment" onChange={photo} /></label>{error && <p role="alert">{error}</p>}<p className="journey-note">QR photos work without native barcode support. Other barcode formats depend on your browser. A registration link alone may not establish the model.</p></div>;
}
