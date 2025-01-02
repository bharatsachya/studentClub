import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

const URL = "http://localhost:3000";
const Room = ({
  name,
  localAudioTrack,
  localVideoTrack,
}: {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [lobby, setLobby] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
  const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = io(URL);

    const handleOffer = async ({ roomId, sdp: remoteSdp }: { roomId: string; sdp: RTCSessionDescriptionInit }) => {
      console.log("Received offer");
      setLobby(false);

      const pc = new RTCPeerConnection();
      setReceivingPc(pc);

      pc.ontrack = (event) => {
        console.log("Track received");
        const [stream] = event.streams;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate (receiver)");
          socket.emit("add-ice-candidate", {
            candidate: event.candidate,
            type: "receiver",
            roomId,
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(remoteSdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer", { roomId, sdp: answer });
    };

    const handleAnswer = async ({ roomId, sdp: remoteSdp }: { roomId: string; sdp: RTCSessionDescriptionInit }) => {
      console.log("Received answer");
      setSendingPc((pc) => {
        pc?.setRemoteDescription(new RTCSessionDescription(remoteSdp));
        return pc;
      });
    };

    const handleIceCandidate = ({ candidate, type }: { candidate: RTCIceCandidate; type: string }) => {
      console.log("Adding ICE candidate");
      if (type === "sender") {
        receivingPc?.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      } else {
        sendingPc?.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      }
    };

    const handleSendOffer = async ({ roomId }: { roomId: string }) => {
      console.log("Sending offer");
      setLobby(false);

      const pc = new RTCPeerConnection();
      setSendingPc(pc);

      if (localVideoTrack) pc.addTrack(localVideoTrack);
      if (localAudioTrack) pc.addTrack(localAudioTrack);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate (sender)");
          socket.emit("add-ice-candidate", {
            candidate: event.candidate,
            type: "sender",
            roomId,
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("offer", { roomId, sdp: offer });
    };

    socket.on("send-offer", handleSendOffer);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("add-ice-candidate", handleIceCandidate);
    socket.on("lobby", () => setLobby(true));

    setSocket(socket);

    return () => {
      socket.disconnect();
      sendingPc?.close();
      receivingPc?.close();
    };
  }, [name, localAudioTrack, localVideoTrack]);

  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {
      const stream = new MediaStream([localVideoTrack]);
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play().catch(console.error);
    }
  }, [localVideoTrack]);

  return (
    <div className="">
      <h1>Hi {name}</h1>
      <video autoPlay width={400} height={400} ref={localVideoRef}/>
      {lobby && <p>Waiting to connect you to someone...</p>}
      <video autoPlay width={400} height={400} ref={remoteVideoRef} />
    </div>
  );
};

export default Room