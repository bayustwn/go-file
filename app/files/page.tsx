'use client';

import Image from "next/image";
import fileIcon from "../../public/file.svg";
import shareIcon from "../../public/share.svg";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Files() {

    const [files,setFiles] = useState({
        folder: "",
        name: "",
        link: ""
    })

    useEffect(()=>{
        getFile()
    },[])

    async function getFile() {
        await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/contents/AJ43Y8?wt=4fd6sg89d7s6`,{
            headers : {
                Authorization : `Bearer ${localStorage.getItem("session_id")}`
            }
        })
        .then(res=>{
           var folder: any = Object.values(res.data.data.children)[0]
           setFiles({folder: res.data.data.name ,name: folder.name,link: folder.link})
        }).catch(()=>{
            toast.error("Error Retrieve File!")
        })
    }

  return (
    <main className="h-screen sm:flex-row overflow-auto flex justify-center items-center">
      <div className="max-w-md px-6 py-6 bg-blue-200 outline outline-white/25 items-center flex flex-col rounded-lg shadow-lg">
        <p className="mb-4 font-medium">{files.folder}</p>
        <div className="w-100">
          <div onClick={()=> window.location.href=files.link} className="cursor-pointer justify-between hover:bg-gray-100 px-3 py-3 rounded-md w-full flex flex-row">
            <div className="flex flex-row items-center gap-1">
              <Image src={fileIcon} width={30} alt="fileIcon" />
              <p className="text-sm">{files.name.length > 20? files.name.slice(0,20) + "..." : files.name}</p>
            </div>
            <Image src={shareIcon} width={20} alt="share_icon"/>
          </div>
        </div>
      </div>
    </main>
  );
}
