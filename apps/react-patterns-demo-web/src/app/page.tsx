import Image from "next/image";
import {
  createStoreExample,
  createSliceExample,
  combineSlicesExample,
  storeName,
} from "react-patterns-docs";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      Hi! ! {createStoreExample} {combineSlicesExample} {createSliceExample}
      {storeName}
    </div>
  );
}
