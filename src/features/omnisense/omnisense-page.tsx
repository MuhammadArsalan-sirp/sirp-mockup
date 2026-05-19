import { useEffect, useRef } from "react"
import lottie from "lottie-web"

export function OmniSensePage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      rendererSettings: {
        filterSize: {
          width: "200%",
          height: "200%",
          x: "-50%",
          y: "-50%",
        },
      },
      loop: true,
      autoplay: true,
      path: "/animations/omnisense/home-06.json",
    })

    return () => anim.destroy()
  }, [])

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden p-5">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
