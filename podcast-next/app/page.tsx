"use client";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
interface ApiResponse {
  items: Array<{
    id: number;
    title: string;
    description: string;
    images: {
      default: string;
      featured: string;
      thumbnail: string;
      wide: string;
    };
  }>;
}
const spinnerAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const spinnerStyle: React.CSSProperties = {
  border: "5px solid #f3f3f3", // Light grey
  borderTop: "5px solid #3498db", // Blue
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  animation: "spin 1s linear infinite",
};


export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  null;
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLastPage, setIsLastPage] = useState<boolean>(false);
  const limit = 10;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const fetchData = async (page: number) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Include inputValue in the API request if it's not empty
      if (inputValue) {
        queryParams.append("search", inputValue);
      }

      const response = await fetch(
        `http://localhost:8080/api/podcasts?${queryParams.toString()}`,
        {
          method: "GET", // Assuming GET request, modify as per your API
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result: ApiResponse = await response.json();
      setData(result);
      setIsLastPage(result.items.length < limit);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchData(currentPage);
  };
  const handleNext = () => {
    if (!isLastPage) {
      setCurrentPage(currentPage + 1);
      fetchData(currentPage + 1);
    }
  };
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      fetchData(currentPage - 1);
    }
  };
  useEffect(() => {
    const handle = setTimeout(() => {
      fetchData(currentPage);
    }, 500);

    return () => clearTimeout(handle); // Clear timeout on cleanup
  }, [inputValue, currentPage]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <style>{spinnerAnimation}</style>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm ">
        <h1 className="text-5xl">Podcast</h1>
        <form onSubmit={handleSubmit}>
          <div className="my-5">
            <input
              className="mr-5 p-2 text-black rounded"
              type="text"
              placeholder="Search..."
              value={inputValue}
              onChange={handleInputChange}
            />
          </div>
        </form>
        {isLoading && (
          <div>
            Loading...<div style={spinnerStyle}></div>
          </div>
        )}
        {data && data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:grid-cols-2">
            {data.items.map((item) => (
              <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 ">
                <img
                  src={`${item.images.thumbnail}`}
                  alt=""
                  className="object-cover w-full h-64 rounded-t-lg"
                />
                <div className="p-5">
                  <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-700 dark:text-gray-400">
                    {item.title}
                  </h2>

                  <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    {item.description}
                  </p>
                  {/* <div className="flex items-center justify-between">
                   <div className="flex items-center ">
                       <img src="https://i.postimg.cc/Qdhgyp8g/second.jpg" alt=""
                           className="object-cover object-right w-8 h-8 rounded-full"/>
                       <div className="ml-2">
                           <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-400">David beckham
                           </h2>
                           <span className="text-sm text-gray-500 dark:text-gray-500">Node developer</span>
                       </div>
                   </div>
               </div> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && data && <div>No data found.</div>
        )}
        <div className="flex justify-center">
          <button
            className="border mx-2rounded p-4"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="border mx-2 rounded p-4"
            onClick={handleNext}
            disabled={isLastPage}
          >
            Next
          </button>
        </div>

        {error && <div>Error: {error}</div>}
      </div>
    </main>
  );
}
