import Image from "next/image";
import Info from "./information";

interface Info {
  image: string;
  fileName: string;
}

const Upload: React.FC<Info> = ({ image, fileName }) => {
  return (
    <div className="flex items-center justify-center flex-col gap-2">
      <Image src={image} width={30} alt="upload_icon" />
      <p className="text-sm">{fileName}</p>
    </div>
  );
};

export default Upload;
