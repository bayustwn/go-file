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

  useEffect(() => {
    getAcc();
  }, []);

  async function getAcc() {
    let id: string = `${localStorage.getItem("account_id")}`;
    await axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/accounts/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("session_id")}`,
        },
      })
      .then((res) => {
        var rootFolder = res.data.data.rootFolder;
        setUserInfo({
          email: res.data.data.email,
          folder: res.data.data.statsCurrent.folderCount,
          file: res.data.data.statsCurrent.fileCount,
          rootFolder: res.data.data.rootFolder,
        });
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
            Authorization: `Bearer ${localStorage.getItem("session_id")}`,
          },
        }
      )
      .then((res) => {
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
    await axios
      .post(
        `https://${process.env.NEXT_PUBLIC_SERVER_LOCATION}.gofile.io/contents/uploadfile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("session_id")}`,
          },
        }
      )
      .then(() => {
        toast.success("File uploaded");
        setUserInfo({
          ...userInfo,
          file: userInfo.file + 1,
          folder: userInfo.folder + 1,
        });
        setFile(null);
      })
      .catch(() => {
        toast.error("File not uploaded");
      })
      .finally(() => {
        setIsUploading(false);
      });
  }

  const open = (folder : string) =>{
    router.push(`/files?folder=${folder}`);
  }

  const logout = () => {
    localStorage.clear();
    router.replace("/");
  };

  return (
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
          <Info image={fileIcon} content={userInfo.file ? userInfo.file : 0} />
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
      <div className="bg-blue-200 h-110  w-110 font-medium px-6 py-6 outline outline-white/25 items-center flex flex-col rounded-lg shadow-lg">
        <p className="mb-4 ">Your Folder</p>
        <div className=" flex flex-col gap-5 overflow-y-auto w-full">
          {Object.values(folder).map((folder: any, index: number) => (
            <div
            onClick={()=>open(folder.name)}
              key={index}
              className="cursor-pointer hover:bg-gray-100 px-3 py-3 rounded-md w-full flex items-center gap-2"
            >
              <Image src={folderIcon} width={30} alt="fileIcon" />
              <p className="text-sm">{folder.name}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
