import { useEffect, useState } from "react";
import { account } from "../services/appwrite";

export default function Watermark() {
  const [email, setEmail] = useState<string>("Loading...");

  useEffect(() => {
    account.get().then((user) => {
      setEmail(user.email);
    }).catch(() => {
      setEmail("Private Content");
    });
  }, []);

  const watermarkText = `CodeArena - ${email}`;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] select-none flex flex-wrap gap-12 p-8 overflow-hidden rotate-[-15deg] h-full w-full">
      {Array.from({ length: 60 }).map((_, i) => (
        <span key={i} className="text-2xl font-bold whitespace-nowrap">
          {watermarkText}
        </span>
      ))}
    </div>
  );
}
