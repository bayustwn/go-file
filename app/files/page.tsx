"use client";

import Image from "next/image";
import fileIcon from "../../public/file.svg";
import shareIcon from "../../public/share.svg";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import Modal from "../components/modal";
import { decryptText } from "../components/encrypt";

export default function Files() {
  const params: ReadonlyURLSearchParams = useSearchParams();
  const folder: string | null = params.get("folder");

  const [files, setFiles] = useState({
    folder: "",
    name: "",
    link: "",
  });
  const [modal, setModal] = useState(false);
  const [isLoading,setIsLoading] = useState(false)
  const [isShort,setIsShort] = useState(false)
  const [isLoadingPage,setIsLoadingPage] = useState(true)

  useEffect(() => {
    getFile();
  }, []);

  async function short() {
    setIsLoading(true);

toast.promise(
  axios.post(
    "https://shortiny.com/api/v1/links",
    {
      url: files.link,
      domain_id: process.env.NEXT_PUBLIC_DOMAIN_ID,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SHORT_KEY}`,
      },
    }
  ),
  {
    loading: 'Shorten Your Link...',
    success: 'Success Short Your Link!',
    error: 'Error While Shorting Your Link!',
  }
)
  .then((res) => {
    setFiles({ ...files, link: res.data.data.short_url });
    setIsShort(true);
  })
  .finally(() => {
    setIsLoading(false);
  });
  }

  async function getFile() {
    await axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/contents/${folder}?wt=4fd6sg89d7s6`,
        {
          headers: {
            Authorization: `Bearer ${decryptText(localStorage.getItem("session_id")!!)}`,
          },
        }
      )
      .then((res) => {
        var folder: any = Object.values(res.data.data.children)[0];
        setFiles({
          folder: res.data.data.name,
          name: folder.name,
          link: folder.link,
        });
        setIsLoadingPage(false)
      })
      .catch(() => {
        toast.error("Error Retrieve File!");
      });
  }

  return (
    <main className="relative h-screen">
      {isLoadingPage? (
        <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center">
        <div className="rounded-full bg-white/80 w-4 h-4 animate-ping"></div>
        <div className="rounded-full bg-white/80 w-4 h-4 animate-ping"></div>
      </div>
      ) : (
        <main className="h-screen sm:flex-row overflow-auto flex justify-center items-center">
        <Modal
        isShort={isShort}
          isOpen={modal}
          link={files.link}
          title={files.name}
          onClose={() => {
            setModal(false);
          }}
          shorten={short}
          loading={isLoading}
        />
        <div className="max-w-md px-6 py-6 bg-blue-200 outline outline-white/25 items-center flex flex-col rounded-lg shadow-lg">
          <p className="mb-4 font-medium">{files.folder}</p>
          <div className="w-100">
            <div
              onClick={() => (window.location.href = files.link)}
              className="cursor-pointer justify-between hover:bg-gray-100 px-3 py-3 rounded-md w-full flex flex-row"
            >
              <div className="flex flex-row items-center gap-1">
                <Image src={fileIcon} width={30} alt="fileIcon" />
                <p className="text-sm">
                  {files.name.length > 20
                    ? files.name.slice(0, 20) + "..."
                    : files.name}
                </p>
              </div>
                <Image
                  onClick={(e) => {
                    setModal(true);
                    e.stopPropagation();
                  }}
                  src={shareIcon}
                  width={20}
                  alt="share_icon"
                />
              </div>
            </div>
        </div>
      </main>
      )}
    </main>
  );
}
