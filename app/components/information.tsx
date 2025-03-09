"use client";

import React from "react";
import Image from "next/image";

interface Information {
  image: string;
  content: number;
}

const Info: React.FC<Information> = ({ image, content }) => {
  return (
    <div className="outline px-7 py-2 flex flex-col gap-1 items-center justify-center outline-white/25 outline-2 rounded-sm hover:bg-gray-100">
      <Image src={image} alt="icon" />
      <p>{content}</p>
    </div>
  );
};

export default Info;
