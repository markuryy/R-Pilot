export default function Brand() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="w-48">
        <img src="/icon_color.png" alt="Brand" />
      </div>
      <div className="text-2xl text-blue-200 mt-4">RPilot</div>
      <div className="text-lg text-blue-200 mt-1">
        Your local R code interpreter
      </div>
    </div>
  );
}