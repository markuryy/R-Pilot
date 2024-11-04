export default function Brand() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="w-48">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon_color.png" alt="Brand" />
      </div>
      <div className="text-2xl text-primary mt-4">RPilot</div>
      <div className="text-lg text-muted-foreground mt-1">
        Your local R code interpreter
      </div>
    </div>
  );
}
