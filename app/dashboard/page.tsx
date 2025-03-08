"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import user from "../../public/user.svg";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default function Home() {
  var router: AppRouterInstance = useRouter();

  const [userInfo, setUserInfo] = useState({
    email: "",
    folder: 0,
    file: 0,
    storage: 0,
  });

  useEffect(() => {
    getAcc();
  },[]);

  async function getAcc() {
    let id: string = `${localStorage.getItem("account_id")}`;
    await axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/accounts/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("session_id")}`,
        },
      })
      .then((res) => {
        setUserInfo({
          email: res.data.data.email,
          folder: res.data.data.statsCurrent.folderCount,
          file: res.data.data.statsCurrent.fileCount,
          storage: res.data.data.statsCurrent.storage,
        });
      })
      .catch(() => {
        router.replace("/");
        localStorage.clear();
      });
  }

  return (
    <main className="h-screen flex justify-center items-center">
      <div className="max-w-md px-6 py-6 bg-blue-200 outline outline-white/25 items-center flex flex-col rounded-lg shadow-lg">
        <Image src={user} width={55} className="mb-3" alt="user_icon" />
        <p className="font-medium">{userInfo.email}</p>
      </div>
    </main>
  );
}
