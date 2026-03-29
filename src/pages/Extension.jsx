export default function ExtensionPage() {
  return (
    <div className=" flex flex-col items-center justify-center text-center px-4">
      {/* Logo Header */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-9 h-9 bg-blurpleLight/20 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">
            extension
          </span>
        </div>

        <h1 className="text-lg font-semibold text-gray-800">
          Home Truths Extension
        </h1>
      </div>

      <div className="flex flex-col items-center mt-64">
        <div className="w-64 h-64 bg-blurpleLight/25 rounded-full flex items-center justify-center mb-8">
          <div className=" rounded-xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="137"
              height="138"
              viewBox="0 0 137 138"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M68.5 11.917C66.9861 11.917 65.5341 12.5184 64.4636 13.5889C63.3931 14.6594 62.7917 16.1114 62.7917 17.6253V29.042H28.5417C25.5138 29.042 22.6099 30.2448 20.4689 32.3859C18.3278 34.5269 17.125 37.4308 17.125 40.4587V114.667C17.125 117.695 18.3278 120.599 20.4689 122.74C22.6099 124.881 25.5138 126.084 28.5417 126.084H108.458C111.486 126.084 114.39 124.881 116.531 122.74C118.672 120.599 119.875 117.695 119.875 114.667V40.4587C119.875 37.4308 118.672 34.5269 116.531 32.3859C114.39 30.2448 111.486 29.042 108.458 29.042H74.2083V17.6253C74.2083 16.1114 73.6069 14.6594 72.5364 13.5889C71.4659 12.5184 70.0139 11.917 68.5 11.917ZM74.2083 29.042V79.4352L84.6432 69.0003C85.7135 67.9292 87.1656 67.3272 88.6798 67.3266C90.194 67.3261 91.6465 67.9271 92.7176 68.9975C93.7887 70.0678 94.3908 71.5199 94.3913 73.0341C94.3918 74.5484 93.7908 76.0008 92.7205 77.0719L73.5405 96.2462C72.2025 97.583 70.3885 98.3339 68.4972 98.3339C66.6058 98.3339 64.7918 97.583 63.4538 96.2462L44.2795 77.0719C43.7496 76.5415 43.3292 75.912 43.0425 75.2192C42.7559 74.5264 42.6084 73.7839 42.6087 73.0341C42.609 72.2843 42.7569 71.5419 43.0441 70.8493C43.3313 70.1567 43.752 69.5275 44.2824 68.9975C44.8128 68.4675 45.4423 68.0471 46.1351 67.7605C46.8279 67.4738 47.5704 67.3264 48.3202 67.3266C49.07 67.3269 49.8124 67.4748 50.505 67.762C51.1976 68.0492 51.8268 68.47 52.3568 69.0003L62.7917 79.4352V29.042H74.2083Z"
                fill="url(#paint0_linear_92_1061)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_92_1061"
                  x1="68.5"
                  y1="11.917"
                  x2="68.5"
                  y2="126.084"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#4A6BFF" />
                  <stop offset="1" stopColor="#7098FE" />
                </linearGradient>
              </defs>
            </svg>{" "}
          </div>
        </div>

        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Download Extension to get started
        </h2>

        <button
          onClick={() =>
            window.open(
              "https://chrome.google.com/webstore/detail/eflpnmhocglklhbgfafegacacjkmekfa",
              "_blank"
            )
          }
          className="bg-primary  text-white font-medium px-6 py-3 rounded-lg text-sm"
        >
          Download Extension
        </button>
      </div>
    </div>
  );
}
