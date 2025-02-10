import { Loader } from "@/components/ui/loader"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader className="w-8 h-8" />
    </div>
  )
}

