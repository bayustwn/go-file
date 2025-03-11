"use client";

import { ChangeEvent, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { encryptText,decryptText } from "./components/encrypt";

export default function Home() {
  const router: AppRouterInstance = useRouter();
  const [email, setEmail] = useState({
    email: "",
    disable: false,
    success: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [key, setKey] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("session_id");
    
    if (session) {
      router.replace("/dashboard");
    } else {
      setLoaded(true);
    }
  }, []);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail({ ...email, email: e.target.value });
  };

  const handleKey = (e: ChangeEvent<HTMLInputElement>) => {
    var valid: number = e.target.value.search(`https://gofile.io/login/`);
    if (valid != -1) {
      setKey(e.target.value);
      setIsLoadingLink(true);
      getAcc();
    }
  };

  async function getAcc() {
    let keys: string = key.replace("https://gofile.io/login/", "");
    await axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/accounts/getid`, {
        headers: {
          Authorization: `Bearer ${keys}`,
        },
      })
      .then((res) => {
        localStorage.setItem("session_id", encryptText(keys));
        localStorage.setItem("account_id",encryptText( res.data.data.id));
        router.replace("/dashboard");
        setIsLoadingLink(false);
      })
      .catch(() => {
        setIsLoadingLink(false);
      });
  }

  async function login() {
    if (email.email) {
      setIsLoading(true);
      setEmail({ ...email, disable: true });
      await axios
        .post(`${process.env.NEXT_PUBLIC_BASE_URL}/accounts`, email)
        .then(() => {
          setIsLoading(false);
          setEmail({ ...email, success: true, disable: true });
          toast.success("Email Sent!");
        })
        .catch(() => {
          toast.error("Sending Email Failed!");
          setIsLoading(false);
          setEmail({ ...email, disable: false });
        });
    } else {
      toast.error("Email Cannot be Empty!");
    }
  }

  return (
    <main className="h-screen flex justify-center items-center">
      {loaded ? (
        <div className="max-w-md px-6 py-6 bg-blue-200 outline outline-white/25 items-center flex flex-col rounded-lg shadow-lg">
          <p className="font-medium">Insert Your Email</p>
          <div className="relative flex flex-col">
            <div className="relative">
              <input
                onChange={handleInput}
                disabled={email.disable}
                className="pr-9 pl-4 my-4 bg-blue-500 py-3 max-w-md  w-sm outline-1 transition-all duration-300 rounded-lg outline-white/0 focus:outline-white/25 disabled:text-gray-500"
                placeholder="abc@gmail.com"
              />
              {isLoading && (
                <div className="absolute right-4 top-0 bottom-0 flex justify-center items-center">
                  <div className="rounded-xl bg-white/80 w-2 h-2 animate-ping"></div>
                </div>
              )}
            </div>
            {email.success ? (
              <div className="relative">
                <input
                  onChange={handleKey}
                  disabled={isLoadingLink}
                  className="pr-9 pl-4 bg-blue-500 py-3 max-w-md  w-sm outline-1 transition-all duration-300 rounded-lg outline-white/0 focus:outline-white/25 disabled:text-gray-500"
                  placeholder="Paste Link Here."
                />
                {isLoadingLink && (
                  <div className="absolute right-4 top-0 bottom-0 flex justify-center items-center">
                    <div className="rounded-xl bg-white/80 w-2 h-2 animate-ping"></div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={login}
                disabled={isLoading}
                className=" cursor-pointer text-sm max-w-md bg-gray-200 rounded-lg py-3 w-sm text-center hover:bg-gray-100"
              >
                <p>{isLoading ? "Sending Email..." : "Send Login Link"}</p>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <div className="rounded-full bg-white/80 w-10 h-10 animate-ping"></div>
          <div className="rounded-full bg-white/80 w-10 h-10 animate-ping"></div>
        </div>
      )}
    </main>
  );
}
