export const layout = "layout.vto";

export default function IndexPage() {
  return (
    <>
      <header class="sticky top-0 h-24 z-30">
        <svg
          class="rotate-180 -z-10 absolute top-0 left-0"
          height="100%"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 70"
          preserveAspectRatio="none"
          fill="url(#gradient)"
        >
          <linearGradient id="gradient">
            <stop style="stop-color: #1d4ed8" offset="0%" />
            <stop style="stop-color: #3b82f6" offset="100%" />
          </linearGradient>
          <rect width="1000" height="61" y="9" />
          <path d="M0 0 Q 500 10 1000 0 L 1000 10 L 0 10 Z" />
        </svg>
        <nav class="z-20 h-full">
          <div class="h-full flex justify-between items-center pb-1 px-8 max-w-screen-lg mx-auto">
            <div>
              <a
                href="/"
                class="text-blue-50
         font-serif font-bold text-2xl hover:underline underline-offset-4"
              >
                MessageFormat 2
              </a>
              <span class="mx-2 text-blue-50 select-none">/</span>
              <span class="text-blue-50 text-lg">Playground</span>
            </div>
            <div class="flex gap-6 items-end">
              <div class="flex flex-col">
                <label
                  for="locale"
                  class="text-md font-bold font-serif px-2 text-blue-50"
                >
                  Locale
                </label>
                <select id="locale" class="w-52 p-2 rounded-lg bg-gray-100">
                  <option id="en-US">English (United States)</option>
                  <option disabled>Loading...</option>
                </select>
              </div>
              <button
                id="share"
                class="inline-block px-3 md:px-4 py-1 md:py-2 text-md font-bold text-blue-600 rounded-full bg-gray-50 hover:bg-blue-200 active:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
              >
                Share
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div class="grid grid-cols-2 px-8 mt-6 mb-24 mx-auto max-w-screen-lg gap-4">
        {
          /* <div class="col-span-2 flex justify-between items-end gap-6">
          <h1 class="text-3xl font-bold font-serif px-2 pb-1 text-blue-900 border-b w-full">
            Playground
          </h1>

          <div class="flex justify-end items-end gap-6">
            <div class="flex flex-col">
              <label
                for="locale"
                class="text-md font-bold font-serif px-2 text-blue-900"
              >
                Locale
              </label>
              <select id="locale" class="w-32 p-2 rounded-lg bg-gray-100">
                <option value="en">English</option>
                <option value="de">German</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="it">Italian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
            <button class="inline-block px-3 md:px-4 py-1 md:py-2 text-md font-bold text-white rounded-full bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 active:from-blue-700 active:to-blue-500 focus:from-blue-700 focus:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white">
              Share
            </button>
          </div>
        </div> */
        }

        <div class="h-72 flex flex-col">
          <label for="message">
            <h2 class="text-xl font-bold font-serif px-2 pb-1 text-blue-900">
              Message
            </h2>
          </label>
          <textarea
            id="message"
            class="w-full h-full resize-none font-mono p-4 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            placeholder="Type your message here..."
          >
            {`Hello {$name}!`}
          </textarea>
          <div
            id="message-errors"
            class="text-red-600 bg-red-50 p-4 mt-2 rounded-lg"
            hidden
          >
          </div>
        </div>
        <div class="h-72 flex flex-col">
          <label for="data">
            <h2 class="text-xl font-bold font-serif px-2 pb-1 text-blue-900">
              Data
            </h2>
          </label>
          <textarea
            id="data"
            class="w-full h-full resize-none font-mono p-4 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            placeholder="Type your data here..."
          >
            {`{\n  "name": "User"\n}`}
          </textarea>
          <div
            id="data-errors"
            class="text-red-600 bg-red-50 p-4 mt-2 rounded-lg"
            hidden
          >
          </div>
        </div>

        <div class="col-span-2">
          <h2 class="text-xl font-bold font-serif px-2 pb-1 text-blue-900">
            Output
          </h2>
          <div class="border rounded-md p-6 text-lg" id="output">
            {`Hello User!`}
          </div>
          <pre
            id="output-errors"
            class="text-red-600 bg-red-50 p-4 mt-2 rounded-lg font-mono"
            hidden
          >
          </pre>
        </div>
      </div>
    </>
  );
}
