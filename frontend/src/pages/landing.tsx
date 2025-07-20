import { useEffect, useRef, useState } from "react";
export const Landing = () => {
  const [name, setName] = useState<string>("");
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  console.log(name, localAudioTrack, localVideoTrack);
  const [joined, setJoined] = useState<boolean>(false);

  const getCam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];
    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);
    if (!videoRef.current) return;
    videoRef.current.srcObject = new MediaStream([videoTrack]);
    videoRef.current.play();
  };

  useEffect(() => {
    getCam();
  }, []);

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="rounded-xl overflow-hidden border border-gray-300 shadow-lg bg-white w-[300px] h-[500px]">
          <video
            autoPlay
            ref={videoRef}
            className="w-full h-full object-cover"
          ></video>
        </div>
        <div className=" space-x-4 mt-4">
          <input
            type="text"
            placeholder="Enter your Question????......"
            className="mt-4 p-2 border border-gray-400 rounded-md w-60 h-20"
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all"
            onClick={() => setJoined(true)}
          >
            Ask
          </button>
        </div>
      </div>
    );
  }
};
