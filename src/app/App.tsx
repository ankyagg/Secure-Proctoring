import { RouterProvider } from "react-router";
import { router } from "./routes";
import backgroundVideo from "../background.mp4";

export default function App() {
  return (
    <>
      {/* Global Persistent Video Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-95 brightness-110 contrast-110"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        {/* Subtle Gradient Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
      </div>
      
      <RouterProvider router={router} />
    </>
  );
}
