"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import Image from "next/image";
import user from "../../public/user.svg";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Info from "../components/information";
import folderIcon from "../../public/folder.svg";
import fileIcon from "../../public/file.svg";
import uploadIcon from "../../public/upload.svg";
import Upload from "../components/upload";
import toast from "react-hot-toast";
import trashIcon from "../../public/trash.svg";
import {decryptText} from '../components/encrypt'

export default function Home() {
  var router: AppRouterInstance = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  const [userInfo, setUserInfo] = useState({
    email: "",
    folder: 0,
    file: 0,
    rootFolder: "",
  });
  const [folder, setFolder] = useState({});

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFolderLoading, setIsFolderLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const inputClick = () => {
    inputRef.current?.click();
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0]!!);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  async function deleteFolder(folder: string) {
    const deletePromise = axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/contents/`,
      {
        headers: {
          Authorization: `Bearer ${decryptText(localStorage.getItem("session_id")!!)}`,
        },
        data: {
          contentsId: folder,
        },
      }
    );

    await toast
      .promise(deletePromise, {
        loading: "Deleting folder...",
        success: "Folder Deleted!",
        error: "Error While Deleting Folder!",
      })
      .then(() => {
        setIsFolderLoading(true);
        getAllFolder(userInfo.rootFolder);
        setUserInfo({
          ...userInfo,
          file: userInfo.file - 1,
          folder: userInfo.folder - 1,
        });
      });
  }

  useEffect(() => {
    getAcc();
  }, []);

  async function getAcc() {
    let id: string = `${decryptText(localStorage.getItem("account_id")!!)}`;
    await axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/accounts/${id}`, {
        headers: {
          Authorization: `Bearer ${decryptText(localStorage.getItem("session_id")!!)}`,
        },
      })
      .then((res) => {
        var rootFolder = res.data.data.rootFolder;
        setUserInfo({
          email: res.data.data.email,
          folder: res.data.data.statsCurrent.folderCount - 1,
          file: res.data.data.statsCurrent.fileCount,
          rootFolder: res.data.data.rootFolder,
        });
        setIsFolderLoading(true);
        setIsLoading(false);
        getAllFolder(rootFolder);
      })
      .catch(() => {
        router.replace("/");
        localStorage.clear();
      });
  }

  async function getAllFolder(rootFolder: string) {
    await axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/contents/${rootFolder}?wt=4fd6sg89d7s6`,
        {
          headers: {
            Authorization: `Bearer ${decryptText(localStorage.getItem("session_id")!!)}`,
          },
        }
      )
      .then((res) => {
        setIsFolderLoading(false);
        setFolder(res.data.data.children);
      })
      .catch(() => {
        toast.error("Error Retrieve Folder!");
      });
  }

  async function upload() {
    const formData = new FormData();
    formData.append("file", file as Blob);
    setIsUploading(true);

    const uploadPromise = axios.post(
      `https://${process.env.NEXT_PUBLIC_SERVER_LOCATION}.gofile.io/contents/uploadfile`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${decryptText(localStorage.getItem("session_id")!!)}`,
        },
      }
    );

    toast
      .promise(uploadPromise, {
        loading: "Uploading Files...",
        success: "Success Upload Files!",
        error: "Error While Uploading Files!",
      })
      .then(() => {
        setUserInfo({
          ...userInfo,
          file: userInfo.file + 1,
          folder: userInfo.folder + 1,
        });
        setFile(null);
        setIsFolderLoading(true);
        getAllFolder(userInfo.rootFolder);
      })
      .finally(() => {
        setIsUploading(false);
      });
  }

  const open = (folder: string) => {
    router.push(`/files?folder=${folder}`);
  };

  const logout = () => {
    localStorage.clear();
    router.replace("/");
  };

  return (
    <main className="relative h-screen">
      {isLoading ? (
        <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center gap-1">
          <div className="rounded-full bg-white/80 w-4 h-4 animate-ping"></div>
          <div className="rounded-full bg-white/80 w-4 h-4 animate-ping"></div>
        </div>
      ) : (
        <main className="h-screen flex-col sm:flex-row overflow-auto flex justify-center items-center gap-5">
          <div className="max-w-md px-6 py-6 bg-blue-200 outline outline-white/25 items-center flex flex-col rounded-lg shadow-lg">
            <Image src={user} width={55} className="mb-3" alt="user_icon" />
            <p className="font-medium mb-2">
              {userInfo.email ? userInfo.email : "User Email"}
            </p>
            <div
              onClick={logout}
              className="bg-red-500 px-8 py-1 cursor-pointer rounded-md hover:bg-red-400"
            >
              <p>Logout</p>
            </div>
            <div className="flex mt-4 justify-between gap-6 items-center">
              <Info
                image={folderIcon}
                content={userInfo.folder ? userInfo.folder : 0}
              />
              <Info
                image={fileIcon}
                content={userInfo.file ? userInfo.file : 0}
              />
            </div>
            <div
              onDragOver={isUploading ? () => {} : onDragOver}
              onDrop={onDrop}
              onDragLeave={onDragLeave}
              onClick={inputClick}
              className={` ${
                isDragging ? "bg-gray-100" : ""
              } flex mt-4 p-20 justify-center items-center flex-col w-100 h-20 bg-blue-500 rounded-md outline-dashed outline otline-5 outline-white/50`}
            >
              {isDragging ? (
                <Upload image={uploadIcon} fileName="Drop file here" />
              ) : file ? (
                <Upload
                  image={fileIcon}
                  fileName={
                    file.name.length > 25
                      ? file.name.slice(0, 25) + "..."
                      : file.name
                  }
                />
              ) : (
                <Upload
                  image={uploadIcon}
                  fileName="Click to Upload or Drop it here"
                />
              )}
            </div>
            <input
              onChange={onFileChange}
              type="file"
              ref={isUploading ? null : inputRef}
              className="hidden"
            />
            {file ? (
              <button
                onClick={upload}
                disabled={isUploading}
                className="mt-4 cursor-pointer text-sm w-100 flex flex-row justify-center items-center gap-2 bg-gray-200 rounded-lg py-3 text-center hover:bg-gray-100"
              >
                <p>{isUploading ? "Uploading..." : "Upload"}</p>
              </button>
            ) : null}
          </div>
          <div className="relative bg-blue-200 h-110  w-110 font-medium px-6 py-6 outline outline-white/25 items-center flex flex-col rounded-lg shadow-lg">
            <p className="mb-4 ">Your Folder</p>
            {isFolderLoading ? (
              <div className="absolute top-0 bottom-0 flex justify-center items-center gap-1">
                <div className="rounded-full bg-white/80 w-4 h-4 animate-ping"></div>
                <div className="rounded-full bg-white/80 w-4 h-4 animate-ping"></div>
              </div>
            ) : (
              <div className="custom-scroll relative flex flex-col h-full gap-5 overflow-y-auto w-full">
                {Object.values(folder).length === 0 ? (
                  <p className="text-sm text-white text-center">
                    Folder Does'nt Exist!
                  </p>
                ) : (
                  Object.values(folder).map((folder: any, index: number) => (
                    <div
                      onClick={() => open(folder.name)}
                      key={index}
                      className="cursor-pointer justify-between hover:bg-gray-100 px-3 py-3 rounded-md w-full flex items-center gap-2"
                    >
                      <div className="flex flex-row items-center gap-2">
                        <Image src={folderIcon} width={30} alt="fileIcon" />
                        <p className="text-sm">{folder.name}</p>
                      </div>
                      <div
                        onClick={(e) => {
                          deleteFolder(folder.id);
                          e.stopPropagation();
                        }}
                        className="bg-red-500 self-end p-1 rounded-md hover:bg-red-400"
                      >
                        <Image src={trashIcon} width={20} alt="trash_icon" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      )}
    </main>
  );
}
