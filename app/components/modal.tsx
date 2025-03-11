"use client";

import Image from "next/image";
import copyIcon from '../../public/copy.svg';
import checklistIcon from '../../public/check.svg';
import toast from "react-hot-toast";
import { useState } from "react";

const Modal = ({
  isOpen,
  onClose,
  shorten,
  title,
  link,
  loading,
  isShort,
}: {
  isOpen: boolean;
  shorten: ()=>void,
  onClose: () => void;
  title: string;
  link: string;
  loading: boolean;
  isShort: boolean,
}) => {
  if (!isOpen) return null;

  const copy = () =>{
    setIsCopy(true)
    navigator.clipboard.writeText(link)
    toast.success("Link Copied to Clipboard!")
  }

  const [isCopy,setIsCopy] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-blue-200 rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="overflow-auto bg-blue-500 rounded-md py-3 px-4 text-md text-gray-500 whitespace-pre-wrap break-words">
          <p className="w-full">{link}</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-white text-2xl"
        >
          &times;
        </button>
        <div className="flex flex-row gap-3">
        <button onClick={isShort? undefined : loading? undefined : shorten } className=" cursor-pointer mt-4 flex-1 text-sm bg-gray-200 rounded-lg py-3 text-center hover:bg-gray-100">
          <p>{isShort? "link is Already Short" : loading? "Loading..." : "Shorten it?"}</p>
        </button>
        <button onClick={isCopy? undefined : copy} className="cursor-pointer mt-4  text-sm bg-gray-200 rounded-lg py-3 px-3 text-center hover:bg-gray-100">
            {isCopy? <Image src={checklistIcon} width={20} alt="succesIcon" /> : <Image src={copyIcon} width={20} alt="copyIcon" /> }
        </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
