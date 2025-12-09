const SkeletonLoader = (props) => {
  return (
    <div
      className={`flex flex-col items-center justify-center w-full mt-5 ${
        props.px ? "px-0" : "px-30"
      }`}
    >
      <div className="w-70 h-8 bg-gray-200 animate-pulse my-10 rounded-md" />
      <div className="grid gap-6 mx-20 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="w-48 h-48 bg-gray-200 rounded-md animate-pulse" />
            <div className="w-40 h-4 bg-gray-200 mt-2 rounded-md animate-pulse" />
            <div className="w-20 h-4 bg-gray-200 mt-2 rounded-md animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
