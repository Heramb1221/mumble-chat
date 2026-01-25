import { LoaderIcon } from "lucide-react";

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#121417]">
      <LoaderIcon className="size-12 animate-spin text-[#4FD1C5]" />
    </div>
  );
}

export default PageLoader;
