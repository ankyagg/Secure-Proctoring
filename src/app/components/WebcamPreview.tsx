import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

interface WebcamPreviewProps {
  username?: string;
}

const WebcamPreview: React.FC<WebcamPreviewProps> = ({ username }) => {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
        stream.getTracks().forEach((t) => t.stop());
      } catch (e) {
        setHasPermission(false);
      }
    };
    checkPermission();
  }, []);

  return (
    <div className="fixed bottom-5 right-5 w-36 h-28 bg-black rounded-xl border border-slate-700 overflow-hidden shadow-xl z-30">
      {hasPermission === false && (
        <div className="flex items-center justify-center h-full text-xs text-red-400">
          Camera blocked
        </div>
      )}
      {hasPermission !== false && (
        <Webcam
          audio={false}
          ref={webcamRef}
          mirrored
          videoConstraints={{ width: 300, height: 200, facingMode: "user" }}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-center px-1">
        <span className="text-slate-200 text-xs truncate">{username || "anonymous"}</span>
      </div>
    </div>
  );
};

export default WebcamPreview;
