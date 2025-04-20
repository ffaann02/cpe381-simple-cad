import { MdAdd, MdClose } from "react-icons/md";

const FileTab = () => {
  return (
    <div className="flex gap-x-2">
      <button className="flex rounded-sm border border-neutral-300 items-center bg-white px-2 py-0.5">
        <p>Untitled.kuay</p>
        <MdClose className="text-lg text-neutral-600 m-auto ml-4 cursor-pointer" />
      </button>
      <button className="flex rounded-sm border border-neutral-300 bg-neutral-100 px-1 py-0.5">
        <MdAdd className="text-lg text-neutral-600 m-auto cursor-pointer" />
      </button>
    </div>
  );
};

export default FileTab;
