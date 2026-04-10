const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1967D2] border-r-transparent align-[-0.125em] text-[#1967D2] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    </div>
  )
}

export default LoadingSpinner
