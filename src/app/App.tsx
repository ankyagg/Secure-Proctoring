import { RouterProvider } from "react-router";
import { router } from "./routes";
import backgroundVideo from "../background.mp4";

export default function App() {
  return (
    <>
      {/* Global Persistent Video Background */}
      <div className="fixed inset-0 z-[-100] overflow-hidden bg-[#0a0c10]">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-90 brightness-125"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        {/* Subtle Gradient Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c10]/10 via-transparent to-[#0a0c10]/80 pointer-events-none" />
      </div>
      
      <RouterProvider router={router} />
    </>
  );
}
