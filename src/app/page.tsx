"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function HomePage() {
  const [message, setMessage] = useState("");

  const fetchBackend = async () => {
    const res = await fetch("http://localhost:4000/api/hello");
    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Hello from Frontend</h1>
      <Button onClick={fetchBackend}>Chamar Backend</Button>
      {message && <p className="mt-4 text-lg">{message}</p>}
    </div>
  );
}
