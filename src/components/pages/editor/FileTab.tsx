import { MdClose } from "react-icons/md";

const FileTab = () => {
  return (
    <button className="flex rounded-sm border border-neutral-300 items-center bg-neutral-200 px-2 py-0.5">
      <p>Untitled.kuay</p>
      <MdClose className="text-xl text-neutral-600 mx-auto ml-4 cursor-pointer" />
    </button>
  );
};

export default FileTab;
